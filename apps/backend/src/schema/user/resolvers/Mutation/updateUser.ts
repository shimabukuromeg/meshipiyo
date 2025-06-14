import { GraphQLError } from 'graphql'
import type { MutationResolvers } from '../../../types.generated'

export const updateUser: NonNullable<MutationResolvers['updateUser']> = async (
  parent,
  args,
  context,
) => {
  if (!context.auth.isAuthenticated || !context.auth.user) {
    throw new GraphQLError('Unauthorized', {
      extensions: { code: 'UNAUTHORIZED' },
    })
  }

  const { input } = args
  const userId = context.auth.user.id

  const updatedUser = await context.prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.displayName && { displayName: input.displayName }),
      ...(input.iconImageURL !== undefined && {
        iconImageURL: input.iconImageURL,
      }),
      ...(input.description !== undefined && {
        description: input.description,
      }),
      ...(input.twitterProfileUrl !== undefined && {
        twitterProfileUrl: input.twitterProfileUrl,
      }),
    },
  })

  return {
    id: updatedUser.id.toString(),
    name: updatedUser.name,
    displayName: updatedUser.displayName,
    email: updatedUser.email,
    iconImageURL: updatedUser.iconImageURL,
    description: updatedUser.description,
    twitterProfileUrl: updatedUser.twitterProfileUrl,
    firebaseUid: updatedUser.firebaseUid,
    authProvider: updatedUser.authProvider,
    createdAt: updatedUser.createdAt.toISOString(),
    updatedAt: updatedUser.updatedAt.toISOString(),
  }
}
