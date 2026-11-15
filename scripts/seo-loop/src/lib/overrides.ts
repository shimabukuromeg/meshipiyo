import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { OVERRIDES_PATH } from './config.js'
import { normalizePath } from './paths.js'

export type MetaOverride = {
  title?: string
  description?: string
}

export type OverrideMap = Record<string, MetaOverride>

export function readOverrides(filePath = OVERRIDES_PATH): OverrideMap {
  if (!existsSync(filePath)) return {}
  return JSON.parse(readFileSync(filePath, 'utf8')) as OverrideMap
}

export function writeOverrides(
  map: OverrideMap,
  filePath = OVERRIDES_PATH,
) {
  const sorted = Object.fromEntries(
    Object.entries(map).sort(([a], [b]) => a.localeCompare(b)),
  )
  writeFileSync(filePath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
}

export function setOverride(
  pathname: string,
  value: MetaOverride,
  filePath = OVERRIDES_PATH,
) {
  const map = readOverrides(filePath)
  map[normalizePath(pathname)] = value
  writeOverrides(map, filePath)
}

export function removeOverride(pathname: string, filePath = OVERRIDES_PATH) {
  const map = readOverrides(filePath)
  delete map[normalizePath(pathname)]
  writeOverrides(map, filePath)
}

export function allTitles(map: OverrideMap = readOverrides()): Set<string> {
  return new Set(
    Object.values(map)
      .map((v) => v.title?.trim())
      .filter((v): v is string => Boolean(v)),
  )
}
