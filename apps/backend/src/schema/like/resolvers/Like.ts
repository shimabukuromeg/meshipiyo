import type { LikeResolvers } from './../../types.generated'

export const Like: LikeResolvers = {
  id: (parent) => parent.id.toString(),
  createdAt: (parent) =>
    parent.createdAt instanceof Date
      ? parent.createdAt.toISOString()
      : parent.createdAt,
  user: (parent) => parent.user!,
  meshi: (parent) => parent.meshi!,
}
