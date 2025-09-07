import type { MeshiResolvers } from './../../types.generated'
export const Meshi: Pick<
  MeshiResolvers,
  | 'address'
  | 'articleId'
  | 'createdAt'
  | 'id'
  | 'imageUrl'
  | 'latitude'
  | 'longitude'
  | 'municipality'
  | 'publishedDate'
  | 'siteUrl'
  | 'storeName'
  | 'title'
  | '__isTypeOf'
> = {
  municipality: (parent, _arg, ctx) => {
    return ctx.prisma.meshi
      .findUnique({
        where: { id: parent.id },
      })
      .municipality()
  },
}
