import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { requireRoles } from './auth.js'
import { prisma } from './prisma.js'

const restaurantSchema = z.object({
  name: z.string().min(2),
  cuisine: z.string().min(2),
  description: z.string().min(10),
  deliveryTime: z.string().min(3),
  deliveryFee: z.number().int().nonnegative(),
  isOpen: z.boolean().optional(),
})

const menuSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(5),
  category: z.string().min(2),
  price: z.number().int().positive(),
  available: z.boolean().optional(),
})

async function canManageRestaurant(userId: string, role: string, restaurantId: string) {
  if (role === 'ADMIN') return true
  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: { ownerId: true } })
  return restaurant?.ownerId === userId
}

const restaurantSelect = {
  id: true, name: true, cuisine: true, description: true, rating: true,
  deliveryTime: true, deliveryFee: true, isOpen: true,
  menuItems: { where: { available: true }, orderBy: { createdAt: 'asc' as const } },
}

export function registerRestaurantRoutes(app: FastifyInstance) {
  app.get('/api/restaurants', async (request) => {
    const query = z.object({ search: z.string().optional(), cuisine: z.string().optional() }).parse(request.query)
    return prisma.restaurant.findMany({
      where: {
        isOpen: true,
        ...(query.search ? { OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { cuisine: { contains: query.search, mode: 'insensitive' } }, { menuItems: { some: { available: true, OR: [{ name: { contains: query.search, mode: 'insensitive' } }, { category: { contains: query.search, mode: 'insensitive' } }] } } }] } : {}),
        ...(query.cuisine ? { cuisine: { contains: query.cuisine, mode: 'insensitive' } } : {}),
      },
      select: restaurantSelect,
      orderBy: { rating: 'desc' },
    })
  })

  app.get('/api/restaurants/:restaurantId', async (request, reply) => {
    const { restaurantId } = z.object({ restaurantId: z.string().min(1) }).parse(request.params)
    const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId }, select: restaurantSelect })
    if (!restaurant) return reply.code(404).send({ error: 'Restaurant not found' })
    return restaurant
  })

  app.get('/api/me/restaurant', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const restaurant = request.user.role === 'ADMIN'
      ? await prisma.restaurant.findFirst({ select: restaurantSelect })
      : await prisma.restaurant.findUnique({
          where: { ownerId: request.user.id },
          select: { ...restaurantSelect, menuItems: { orderBy: { createdAt: 'asc' as const } } },
        })
    if (!restaurant) return reply.code(404).send({ error: 'Restaurant not found' })
    return restaurant
  })

  app.post('/api/restaurants', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const input = restaurantSchema.parse(request.body)
    const ownerId = request.user.role === 'RESTAURANT_ADMIN' ? request.user.id : request.user.id
    const restaurant = await prisma.restaurant.create({ data: { ...input, ownerId }, select: restaurantSelect })
    return reply.code(201).send(restaurant)
  })

  app.patch('/api/restaurants/:restaurantId', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const { restaurantId } = z.object({ restaurantId: z.string() }).parse(request.params)
    if (!await canManageRestaurant(request.user.id, request.user.role, restaurantId)) return reply.code(403).send({ error: 'You cannot manage this restaurant' })
    const input = restaurantSchema.partial().parse(request.body)
    const restaurant = await prisma.restaurant.update({ where: { id: restaurantId }, data: input, select: restaurantSelect })
    return restaurant
  })

  app.delete('/api/restaurants/:restaurantId', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const { restaurantId } = z.object({ restaurantId: z.string() }).parse(request.params)
    if (!await canManageRestaurant(request.user.id, request.user.role, restaurantId)) return reply.code(403).send({ error: 'You cannot manage this restaurant' })
    await prisma.restaurant.delete({ where: { id: restaurantId } })
    return reply.code(204).send()
  })

  app.post('/api/restaurants/:restaurantId/menu', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const { restaurantId } = z.object({ restaurantId: z.string() }).parse(request.params)
    if (!await canManageRestaurant(request.user.id, request.user.role, restaurantId)) return reply.code(403).send({ error: 'You cannot manage this restaurant' })
    const input = menuSchema.parse(request.body)
    return reply.code(201).send(await prisma.menuItem.create({ data: { ...input, restaurantId }, }))
  })

  app.patch('/api/menu/:menuItemId', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const { menuItemId } = z.object({ menuItemId: z.string() }).parse(request.params)
    const item = await prisma.menuItem.findUnique({ where: { id: menuItemId }, select: { restaurantId: true } })
    if (!item || !await canManageRestaurant(request.user.id, request.user.role, item.restaurantId)) return reply.code(403).send({ error: 'You cannot manage this menu item' })
    return prisma.menuItem.update({ where: { id: menuItemId }, data: menuSchema.partial().parse(request.body) })
  })

  app.delete('/api/menu/:menuItemId', { onRequest: [app.authenticate, requireRoles('ADMIN', 'RESTAURANT_ADMIN')] }, async (request, reply) => {
    const { menuItemId } = z.object({ menuItemId: z.string() }).parse(request.params)
    const item = await prisma.menuItem.findUnique({ where: { id: menuItemId }, select: { restaurantId: true } })
    if (!item || !await canManageRestaurant(request.user.id, request.user.role, item.restaurantId)) return reply.code(403).send({ error: 'You cannot manage this menu item' })
    await prisma.menuItem.delete({ where: { id: menuItemId } })
    return reply.code(204).send()
  })
}
