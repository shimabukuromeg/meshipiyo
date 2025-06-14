import type { UserResolvers } from './../../types.generated'

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
  createdAt: (parent) => parent.createdAt.toISOString(),
  updatedAt: (parent) => parent.updatedAt.toISOString(),
}
