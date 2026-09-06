import bcrypt from 'bcryptjs'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { Role } from '@prisma/client'

export const hashPassword = (password: string) => bcrypt.hash(password, 12)
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash)

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    return reply.code(401).send({ error: 'Authentication required' })
  }
}

export function requireRoles(...roles: Role[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!roles.includes(request.user.role)) {
      return reply.code(403).send({ error: 'You do not have permission for this action' })
    }
  }
}

export function registerAuth(app: FastifyInstance) {
  app.decorate('authenticate', authenticate)
}
