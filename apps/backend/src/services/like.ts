import type {
  Meshi,
  PrismaClient,
  Like as PrismaLike,
  User,
} from '@prisma/client'
import { createChildLogger } from '../lib/logger'

export interface LikeConnection {
  edges: LikeEdge[]
  pageInfo: PageInfo
  totalCount: number
}

export interface LikeEdge {
  node: LikeWithRelations
  cursor: string
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor?: string
  endCursor?: string
}

export interface LikeWithRelations extends PrismaLike {
  user?: User
  meshi?: Meshi
}

export class LikeService {
  private logger = createChildLogger({ service: 'LikeService' })

  constructor(private prisma: PrismaClient) {}

  async likeMeshi(userId: number, meshiId: number): Promise<LikeWithRelations> {
    this.logger.info({ userId, meshiId }, 'likeMeshi開始')
    try {
      const like = await this.prisma.like.create({
        data: {
          userId,
          meshiId,
        },
        include: {
          user: true,
          meshi: true,
        },
      })

      this.logger.info({ userId, meshiId, likeId: like.id }, 'likeMeshi成功')
      return like
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        this.logger.warn(
          { userId, meshiId, error: error.code },
          'likeMeshi失敗: 既にいいね済み',
        )
        throw new Error('既にいいねしています')
      }
      this.logger.error({ userId, meshiId, error }, 'likeMeshiエラー')
      throw error
    }
  }

  async unlikeMeshi(userId: number, meshiId: number): Promise<boolean> {
    this.logger.info({ userId, meshiId }, 'unlikeMeshi開始')
    try {
      await this.prisma.like.delete({
        where: {
          userId_meshiId: {
            userId,
            meshiId,
          },
        },
      })
      this.logger.info({ userId, meshiId }, 'unlikeMeshi成功')
      return true
    } catch (error: unknown) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2025'
      ) {
        this.logger.warn(
          { userId, meshiId, error: error.code },
          'unlikeMeshi失敗: いいねが見つからない',
        )
        throw new Error('いいねが見つかりません')
      }
      this.logger.error({ userId, meshiId, error }, 'unlikeMeshiエラー')
      throw error
    }
  }

  async getUserLikes(
    userId: number,
    cursor?: string,
    limit = 20,
  ): Promise<LikeConnection> {
    this.logger.info({ userId, cursor, limit }, 'getUserLikes開始')
    const where = { userId }
    const orderBy = { createdAt: 'desc' as const }

    let cursorWhere = {}
    if (cursor) {
      const cursorLike = await this.prisma.like.findUnique({
        where: { id: Number.parseInt(cursor, 10) },
      })
      if (cursorLike) {
        cursorWhere = {
          createdAt: { lt: cursorLike.createdAt },
        }
      }
    }

    const likes = await this.prisma.like.findMany({
      where: { ...where, ...cursorWhere },
      include: {
        user: true,
        meshi: true,
      },
      orderBy,
      take: limit + 1,
    })

    const hasNextPage = likes.length > limit
    const nodes = hasNextPage ? likes.slice(0, -1) : likes

    const totalCount = await this.prisma.like.count({ where })

    const edges: LikeEdge[] = nodes.map((like) => ({
      node: like,
      cursor: like.id.toString(),
    }))

    this.logger.info(
      { userId, returnedCount: edges.length, totalCount, hasNextPage },
      'getUserLikes成功',
    )
    return {
      edges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage: !!cursor,
        startCursor: edges.length > 0 ? edges[0].cursor : undefined,
        endCursor:
          edges.length > 0 ? edges[edges.length - 1].cursor : undefined,
      },
      totalCount,
    }
  }

  async getMeshiLikeStates(
    userId: number,
    meshiIds: number[],
  ): Promise<Map<number, boolean>> {
    const likes = await this.prisma.like.findMany({
      where: {
        userId,
        meshiId: { in: meshiIds },
      },
      select: { meshiId: true },
    })

    const likeMap = new Map<number, boolean>()
    for (const meshiId of meshiIds) {
      likeMap.set(meshiId, false)
    }

    for (const like of likes) {
      likeMap.set(like.meshiId, true)
    }

    return likeMap
  }

  async getMeshiLikeCount(meshiId: number): Promise<number> {
    return await this.prisma.like.count({
      where: { meshiId },
    })
  }

  async getMeshiLikeCounts(meshiIds: number[]): Promise<Map<number, number>> {
    const likeCounts = await this.prisma.like.groupBy({
      by: ['meshiId'],
      where: {
        meshiId: { in: meshiIds },
      },
      _count: true,
    })

    const countMap = new Map<number, number>()
    for (const meshiId of meshiIds) {
      countMap.set(meshiId, 0)
    }

    for (const count of likeCounts) {
      countMap.set(count.meshiId, count._count)
    }

    return countMap
  }

  async getUserLikeCount(userId: number): Promise<number> {
    return await this.prisma.like.count({
      where: { userId },
    })
  }
}
