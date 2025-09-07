import type { QueryResolvers } from '../../../types.generated'

export const me: NonNullable<QueryResolvers['me']> = async (
  _parent,
  _args,
  context,
) => {
  if (!context.auth.isAuthenticated || !context.auth.user) {
    return null
  }

  const user = await context.prisma.user.findUnique({
    where: { id: context.auth.user.id },
  })

  if (!user) {
    return null
  }

  return {
    id: user.id.toString(),
    name: user.name,
    displayName: user.displayName,
    email: user.email,
    iconImageURL: user.iconImageURL,
    description: user.description,
    twitterProfileUrl: user.twitterProfileUrl,
    firebaseUid: user.firebaseUid,
    authProvider: user.authProvider,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
