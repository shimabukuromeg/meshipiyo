import { PrismaClient } from '@prisma/client'
import { createClient } from '../src/micro-cms-schemas/generated'
import { authenticateUser, type AuthContext } from './middleware/auth'
import type { FastifyRequest } from 'fastify'

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

export async function createContext(context: { req: FastifyRequest }): Promise<GraphQLContext> {
  const auth = await authenticateUser(context.req, prisma)
  
  return { 
    prisma, 
    microCms,
    auth
  }
}
