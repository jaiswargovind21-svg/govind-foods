import 'dotenv/config'
import Fastify from 'fastify'
import cors from '@fastify/cors'
import fastifyJwt from '@fastify/jwt'
import { Prisma, OrderStatus, Role } from '@prisma/client'
import { z } from 'zod'
import { authenticate, hashPassword, registerAuth, requireRoles, verifyPassword } from './auth.js'
import { prisma } from './prisma.js'
import { registerRestaurantRoutes } from './restaurants.js'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) throw new Error('JWT_SECRET must be configured')

const app = Fastify({ logger: true })
await app.register(cors, { origin: true })
await app.register(fastifyJwt, { secret: jwtSecret })
registerAuth(app)

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })
const createOrderSchema = z.object({
  restaurantId: z.string().min(1),
  items: z.array(z.object({ menuItemId: z.string().min(1), quantity: z.number().int().positive() })).min(1),
  deliveryAddress: z.string().min(5),
})
const statuses = ['PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'DELIVERED'] as const

function publicUser(user: { id: string; email: string; name: string; role: Role }) {
  return { id: user.id, email: user.email, name: user.name, role: user.role }
}

app.get('/health', async () => ({ status: 'ok', service: 'food-delivery-api', database: 'postgresql' }))

app.post('/api/auth/signup', async (request, reply) => {
  const input = signupSchema.parse(request.body)
  const user = await prisma.user.create({ data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password) }, select: { id: true, email: true, name: true, role: true } })
  const token = app.jwt.sign(publicUser(user))
  return reply.code(201).send({ user, token })
})

app.post('/api/auth/login', async (request, reply) => {
  const input = loginSchema.parse(request.body)
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || !await verifyPassword(input.password, user.passwordHash)) return reply.code(401).send({ error: 'Invalid email or password' })
  const safeUser = publicUser(user)
  return { user: safeUser, token: app.jwt.sign(safeUser) }
})

app.get('/api/auth/me', { onRequest: [authenticate] }, async (request) => request.user)

app.get('/api/admin/users', { onRequest: [authenticate, requireRoles('RESTAURANT_ADMIN', 'ADMIN')] }, async () => {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'desc' },
  })
})

app.post('/api/orders', { onRequest: [authenticate, requireRoles('CUSTOMER', 'ADMIN')] }, async (request, reply) => {
  const input = createOrderSchema.parse(request.body)
  const restaurant = await prisma.restaurant.findUnique({ where: { id: input.restaurantId }, include: { menuItems: true } })
  if (!restaurant) return reply.code(404).send({ error: 'Restaurant not found' })
  if (!restaurant.isOpen) return reply.code(409).send({ error: 'Restaurant is currently closed' })
  const orderItems = input.items.map((requestedItem) => {
    const menuItem = restaurant.menuItems.find((item) => item.id === requestedItem.menuItemId && item.available)
    if (!menuItem) throw new Error(`Menu item unavailable: ${requestedItem.menuItemId}`)
    return { menuItemId: menuItem.id, name: menuItem.name, price: menuItem.price, quantity: requestedItem.quantity }
  })
  const subtotal = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const order = await prisma.order.create({
    data: { customerId: request.user.id, restaurantId: restaurant.id, deliveryAddress: input.deliveryAddress, subtotal, deliveryFee: restaurant.deliveryFee, total: subtotal + restaurant.deliveryFee, items: { create: orderItems } },
    include: { items: true },
  })
  return reply.code(201).send(order)
})

app.get('/api/orders/:orderId', { onRequest: [authenticate] }, async (request, reply) => {
  const { orderId } = z.object({ orderId: z.string() }).parse(request.params)
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, restaurant: true } })
  if (!order) return reply.code(404).send({ error: 'Order not found' })
  const isRestaurantOwner = order.restaurant.ownerId === request.user.id
  if (request.user.role !== 'ADMIN' && order.customerId !== request.user.id && !isRestaurantOwner) return reply.code(403).send({ error: 'You cannot view this order' })
  return order
})

app.get('/api/me/restaurant/orders', { onRequest: [authenticate, requireRoles('RESTAURANT_ADMIN', 'ADMIN')] }, async (request) => {
  return prisma.order.findMany({
    where: request.user.role === 'ADMIN' ? {} : { restaurant: { ownerId: request.user.id } },
    include: { items: true, restaurant: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })
})

app.patch('/api/orders/:orderId/status', { onRequest: [authenticate, requireRoles('RESTAURANT_ADMIN', 'ADMIN')] }, async (request, reply) => {
  const { orderId } = z.object({ orderId: z.string() }).parse(request.params)
  const { status } = z.object({ status: z.enum([...statuses, 'CANCELLED'] as const) }).parse(request.body)
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { restaurant: true } })
  if (!order) return reply.code(404).send({ error: 'Order not found' })
  if (request.user.role !== 'ADMIN' && order.restaurant.ownerId !== request.user.id) return reply.code(403).send({ error: 'You cannot update this order' })
  const currentIndex = order.status === 'CANCELLED' ? -1 : statuses.indexOf(order.status)
  const nextIndex = status === 'CANCELLED' ? -1 : statuses.indexOf(status)
  if (status !== 'CANCELLED' && nextIndex !== currentIndex + 1) return reply.code(409).send({ error: `Invalid transition from ${order.status} to ${status}` })
  return prisma.order.update({ where: { id: orderId }, data: { status: status as OrderStatus }, include: { items: true } })
})

registerRestaurantRoutes(app)

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof z.ZodError) return reply.code(400).send({ error: 'Invalid request', details: error.issues })
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return reply.code(409).send({ error: 'A record with these unique values already exists' })
  app.log.error(error)
  return reply.code(500).send({ error: 'Internal server error' })
})

const port = Number(process.env.PORT ?? 3000)
const host = process.env.HOST ?? '127.0.0.1'
await app.listen({ port, host })
