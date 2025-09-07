import type { MunicipalityResolvers } from './../../types.generated'
export const Municipality: MunicipalityResolvers = {
  meshis: (parent, _arg, ctx) => {
    return ctx.prisma.meshi.findMany({
      where: { municipalityMeshis: parent.id },
      orderBy: {
        publishedDate: 'desc',
      },
    })
  },
}
