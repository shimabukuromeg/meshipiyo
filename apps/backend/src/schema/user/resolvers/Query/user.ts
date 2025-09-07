import type { QueryResolvers } from './../../../types.generated'
export const user: NonNullable<QueryResolvers['user']> = async (
  _parent,
  _arg,
  _ctx,
) => {
  const user = await _ctx.prisma.user.findUnique({
    where: { id: Number.parseInt(_arg.id, 10) },
  })
  return user
}
