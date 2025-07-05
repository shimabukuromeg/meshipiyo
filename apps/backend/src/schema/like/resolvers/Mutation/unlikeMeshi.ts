
import type { MutationResolvers } from './../../../types.generated'
import { LikeService } from '../../../../services/like'

export const unlikeMeshi: NonNullable<MutationResolvers['unlikeMeshi']> = async (
  _parent,
  { meshiId },
  { prisma, auth },
) => {
  if (!auth.isAuthenticated || !auth.user) {
    throw new Error('認証が必要です')
  }

  const likeService = new LikeService(prisma)
  return await likeService.unlikeMeshi(auth.user.id, Number.parseInt(meshiId))
}