import { PrismaClient } from '@prisma/client'
import type { FastifyRequest } from 'fastify'
import { createClient } from '../src/micro-cms-schemas/generated'
import { type AuthContext, authenticateUser } from './middleware/auth'

const prisma = new PrismaClient()
const microCms = createClient({
  serviceDomain: 'shimabukuromeg',
  apiKey: process.env.MICRO_CMS_API_KEY || '',
})

export type GraphQLContext = {
  prisma: PrismaClient
  microCms: ReturnType<typeof createClient>
  auth: AuthContext
}

export async function createContext(context: {
  req: FastifyRequest
}): Promise<GraphQLContext> {
  const auth = await authenticateUser(context.req, prisma)

  return {
    prisma,
    microCms,
    auth,
  }
}
