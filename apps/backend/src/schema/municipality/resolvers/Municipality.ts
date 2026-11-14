import type { MunicipalityResolvers } from './../../types.generated'

export const Municipality: MunicipalityResolvers = {
  meshis: (parent, arg, ctx) => {
    return ctx.prisma.meshi.findMany({
      where: { municipalityMeshis: parent.id },
      orderBy: {
        publishedDate: 'desc',
      },
      take: arg.first ?? undefined,
    })
  },
}
