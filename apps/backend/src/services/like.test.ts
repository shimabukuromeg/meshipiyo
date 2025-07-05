import type { PrismaClient } from '@prisma/client'
import { vi, describe, it, expect, beforeEach } from 'vitest'
import { LikeService } from './like'

const prismaMock = {
  like: {
    create: vi.fn(),
    delete: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    groupBy: vi.fn(),
  },
} as unknown as PrismaClient

describe('LikeService', () => {
  let likeService: LikeService

  beforeEach(() => {
    likeService = new LikeService(prismaMock)
    vi.clearAllMocks()
  })

  describe('likeMeshi', () => {
    it('should create a like successfully', async () => {
      const mockLike = {
        id: 1,
        userId: 1,
        meshiId: 1,
        createdAt: new Date(),
        user: { id: 1, name: 'Test User' },
        meshi: { id: 1, title: 'Test Meshi' },
      }

      prismaMock.like.create = vi.fn().mockResolvedValue(mockLike)

      const result = await likeService.likeMeshi(1, 1)

      expect(prismaMock.like.create).toHaveBeenCalledWith({
        data: { userId: 1, meshiId: 1 },
        include: { user: true, meshi: true },
      })
      expect(result).toEqual(mockLike)
    })

    it('should throw error for duplicate like', async () => {
      const error = new Error('Unique constraint failed') as Error & { code: string }
      error.code = 'P2002'
      prismaMock.like.create = vi.fn().mockRejectedValue(error)

      await expect(likeService.likeMeshi(1, 1)).rejects.toThrow(
        '既にいいねしています',
      )
    })
  })

  describe('unlikeMeshi', () => {
    it('should delete a like successfully', async () => {
      prismaMock.like.delete = vi.fn().mockResolvedValue({})

      const result = await likeService.unlikeMeshi(1, 1)

      expect(prismaMock.like.delete).toHaveBeenCalledWith({
        where: {
          userId_meshiId: { userId: 1, meshiId: 1 },
        },
      })
      expect(result).toBe(true)
    })

    it('should throw error when like not found', async () => {
      const error = new Error('Record not found') as Error & { code: string }
      error.code = 'P2025'
      prismaMock.like.delete = vi.fn().mockRejectedValue(error)

      await expect(likeService.unlikeMeshi(1, 1)).rejects.toThrow(
        'いいねが見つかりません',
      )
    })
  })

  describe('getUserLikes', () => {
    it('should return user likes with pagination', async () => {
      const mockLikes = [
        {
          id: 1,
          userId: 1,
          meshiId: 1,
          createdAt: new Date(),
          user: { id: 1, name: 'Test User' },
          meshi: { id: 1, title: 'Test Meshi' },
        },
      ]

      prismaMock.like.findMany = vi.fn().mockResolvedValue(mockLikes)
      prismaMock.like.count = vi.fn().mockResolvedValue(1)

      const result = await likeService.getUserLikes(1)

      expect(result.edges).toHaveLength(1)
      expect(result.totalCount).toBe(1)
      expect(result.pageInfo.hasNextPage).toBe(false)
    })
  })

  describe('getMeshiLikeStates', () => {
    it('should return like states for multiple meshis', async () => {
      const mockLikes = [{ meshiId: 1 }, { meshiId: 3 }]
      prismaMock.like.findMany = vi.fn().mockResolvedValue(mockLikes)

      const result = await likeService.getMeshiLikeStates(1, [1, 2, 3])

      expect(result.get(1)).toBe(true)
      expect(result.get(2)).toBe(false)
      expect(result.get(3)).toBe(true)
    })
  })

  describe('getMeshiLikeCount', () => {
    it('should return like count for a meshi', async () => {
      prismaMock.like.count = vi.fn().mockResolvedValue(5)

      const result = await likeService.getMeshiLikeCount(1)

      expect(result).toBe(5)
      expect(prismaMock.like.count).toHaveBeenCalledWith({
        where: { meshiId: 1 },
      })
    })
  })

  describe('getMeshiLikeCounts', () => {
    it('should return like counts for multiple meshis', async () => {
      const mockCounts = [
        { meshiId: 1, _count: 5 },
        { meshiId: 3, _count: 3 },
      ]
      prismaMock.like.groupBy = vi.fn().mockResolvedValue(mockCounts)

      const result = await likeService.getMeshiLikeCounts([1, 2, 3])

      expect(result.get(1)).toBe(5)
      expect(result.get(2)).toBe(0)
      expect(result.get(3)).toBe(3)
    })
  })

  describe('getUserLikeCount', () => {
    it('should return user like count', async () => {
      prismaMock.like.count = vi.fn().mockResolvedValue(10)

      const result = await likeService.getUserLikeCount(1)

      expect(result).toBe(10)
      expect(prismaMock.like.count).toHaveBeenCalledWith({
        where: { userId: 1 },
      })
    })
  })
})