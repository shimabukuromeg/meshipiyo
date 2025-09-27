/**
 * Relay形式のカーソルベースページネーションのためのユーティリティ
 */

/**
 * IDからカーソル文字列を生成する
 * @param id 数値ID
 * @returns Base64エンコードされたカーソル文字列
 */
export function encodeCursor(id: number): string {
  return Buffer.from(`meshi:${id}`).toString('base64')
}

/**
 * カーソル文字列からIDを復元する
 * @param cursor Base64エンコードされたカーソル文字列
 * @returns 数値ID
 */
export function decodeCursor(cursor: string): number {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
  const parts = decoded.split(':')
  if (parts.length !== 2 || parts[0] !== 'meshi') {
    throw new Error('Invalid cursor format')
  }
  return Number.parseInt(parts[1], 10)
}

/**
 * Composite cursor for Meshi pagination aligned with ordering (publishedDate desc, id desc)
 * Encoded as Base64 of: `meshi2:<publishedDateMs>:<id>`
 */
export function encodeMeshiCursor(publishedDate: Date, id: number): string {
  const ts = publishedDate.getTime()
  return Buffer.from(`meshi2:${ts}:${id}`).toString('base64')
}

/**
 * Decode composite Meshi cursor. Falls back to legacy `meshi:<id>` format.
 */
export function decodeMeshiCursor(cursor: string): {
  id: number
  publishedDateMs?: number
} {
  const decoded = Buffer.from(cursor, 'base64').toString('utf-8')
  const parts = decoded.split(':')
  if (parts[0] === 'meshi2' && parts.length === 3) {
    const ts = Number.parseInt(parts[1], 10)
    const id = Number.parseInt(parts[2], 10)
    return { id, publishedDateMs: Number.isNaN(ts) ? undefined : ts }
  }
  if (parts[0] === 'meshi' && parts.length === 2) {
    const id = Number.parseInt(parts[1], 10)
    return { id }
  }
  throw new Error('Invalid cursor format')
}
