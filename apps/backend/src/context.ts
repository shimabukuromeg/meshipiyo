import { PrismaClient } from '@prisma/client'
import { createClient } from '../src/micro-cms-schemas/generated'

const prisma = new PrismaClient()
const microCms = createClient({
  serviceDomain: 'shimabukuromeg',
  apiKey: process.env.MICRO_CMS_API_KEY || '',
})

export type GraphQLContext = {
  prisma: PrismaClient
  microCms: ReturnType<typeof createClient>
}

export async function createContext(): Promise<GraphQLContext> {
  return {
    prisma,
    microCms,
  }
}
