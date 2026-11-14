import type { MeshiResolvers } from './../../types.generated'

export const Meshi: MeshiResolvers = {
  municipality: (parent, _arg, ctx) => {
    return ctx.prisma.meshi
      .findUnique({
        where: { id: parent.id },
      })
      .municipality()
  },
  socialMentions: (parent, _arg, ctx) => {
    return ctx.prisma.socialMention.findMany({
      where: { meshiId: parent.id },
      orderBy: { createdAt: 'desc' },
    })
  },
}
