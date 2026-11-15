import type { SocialMention } from '@prisma/client'
import type { MeshiResolvers } from './../../types.generated'

export const Meshi: MeshiResolvers = {
  municipality: (parent, _arg, ctx) => {
    return ctx.prisma.meshi
      .findUnique({
        where: { id: parent.id },
      })
      .municipality()
  },
  socialMentions: async (parent, _arg, ctx) => {
    const mentions = await ctx.prisma.socialMention.findMany({
      where: { meshiId: parent.id },
    })
    const confidenceRank = (value: string | null | undefined) => {
      if (value === 'high') return 0
      if (value === 'medium') return 1
      return 2
    }
    return [...mentions].sort((a: SocialMention, b: SocialMention) => {
      const byConfidence =
        confidenceRank(a.confidence) - confidenceRank(b.confidence)
      if (byConfidence !== 0) return byConfidence
      const aTime = a.postedAt?.getTime() ?? a.createdAt.getTime()
      const bTime = b.postedAt?.getTime() ?? b.createdAt.getTime()
      return bTime - aTime
    })
  },
}
