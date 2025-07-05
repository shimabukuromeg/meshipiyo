
import type { MutationResolvers } from './../../../types.generated'
import { LikeService } from '../../../../services/like'

export const likeMeshi: NonNullable<MutationResolvers['likeMeshi']> = async (
  _parent,
  { meshiId },
  { prisma, auth },
) => {
  if (!auth.isAuthenticated || !auth.user) {
    throw new Error('認証が必要です')
  }

  const likeService = new LikeService(prisma)
  const like = await likeService.likeMeshi(auth.user.id, Number.parseInt(meshiId))

  // GraphQLリゾルバーが期待する形式で返す
  // user と meshi フィールドはLikeリゾルバーで解決される
  return {
    id: like.id,
    createdAt: like.createdAt,
    user: like.user!,
    meshi: like.meshi!,
  }
}