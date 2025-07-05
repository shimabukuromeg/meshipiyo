import type { UserResolvers } from './../../types.generated'
import { LikeService } from '../../../services/like'

export const User: UserResolvers = {
  id: (parent) => parent.id.toString(),
  name: (parent) => parent.name,
  displayName: (parent) => parent.displayName,
  email: (parent) => parent.email,
  iconImageURL: (parent) => parent.iconImageURL,
  description: (parent) => parent.description,
  twitterProfileUrl: (parent) => parent.twitterProfileUrl,
  firebaseUid: (parent) => parent.firebaseUid,
  authProvider: (parent) => parent.authProvider,
  createdAt: (parent) =>
    parent.createdAt instanceof Date
      ? parent.createdAt.toISOString()
      : parent.createdAt,
  updatedAt: (parent) =>
    parent.updatedAt instanceof Date
      ? parent.updatedAt.toISOString()
      : parent.updatedAt,
  likeCount: async (parent, _arg, { prisma }) => {
    const likeService = new LikeService(prisma)
    return await likeService.getUserLikeCount(typeof parent.id === 'string' ? Number.parseInt(parent.id) : parent.id)
  },
}
