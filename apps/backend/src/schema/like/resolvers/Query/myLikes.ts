import { LikeService } from '../../../../services/like'
import type { QueryResolvers } from './../../../types.generated'

export const myLikes: NonNullable<QueryResolvers['myLikes']> = async (
  _parent,
  { first = 20, after },
  { prisma, auth },
) => {
  if (!auth.isAuthenticated || !auth.user) {
    throw new Error('認証が必要です')
  }

  const likeService = new LikeService(prisma)
  const connection = await likeService.getUserLikes(
    auth.user.id,
    after || undefined,
    first,
  )

  return {
    edges: connection.edges.map((edge) => ({
      node: {
        id: edge.node.id,
        createdAt: edge.node.createdAt,
        user: edge.node.user!,
        meshi: edge.node.meshi!,
      },
      cursor: edge.cursor,
    })),
    pageInfo: connection.pageInfo,
    totalCount: connection.totalCount,
  }
}
