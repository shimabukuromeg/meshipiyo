import { LikeService } from '../../../services/like'
import type { MeshiResolvers } from './../../types.generated'

export const Meshi: Pick<MeshiResolvers, 'isLiked'|'likeCount'> = {
  isLiked: async (parent, _arg, { prisma, auth }) => {
    if (!auth.isAuthenticated || !auth.user) {
      return false
    }

    const likeService = new LikeService(prisma)
    const likeStates = await likeService.getMeshiLikeStates(auth.user.id, [
      parent.id,
    ])
    return likeStates.get(parent.id) || false
  },

  likeCount: async (parent, _arg, { prisma }) => {
    const likeService = new LikeService(prisma)
    return await likeService.getMeshiLikeCount(parent.id)
  },
}
