import { execFileSync } from 'node:child_process'
import { REPO_ROOT } from './config.js'

function run(
  command: string,
  args: string[],
  options?: { cwd?: string; input?: string },
): string {
  return execFileSync(command, args, {
    cwd: options?.cwd ?? REPO_ROOT,
    encoding: 'utf8',
    input: options?.input,
    stdio: ['pipe', 'pipe', 'pipe'],
  }).trim()
}

export function git(args: string[]): string {
  return run('git', args)
}

export function gh(args: string[]): string {
  return run('gh', args)
}

export function currentBranch(): string {
  return git(['rev-parse', '--abbrev-ref', 'HEAD'])
}

export function ensureCleanOrAllowDirty() {
  // apply creates its own branch from origin/main; dirty tree is handled carefully
}

export function filesInOpenPullRequests(): Set<string> {
  const files = new Set<string>()
  let json = '[]'
  try {
    json = gh([
      'pr',
      'list',
      '--state',
      'open',
      '--json',
      'files',
      '--limit',
      '50',
    ])
  } catch {
    return files
  }
  const prs = JSON.parse(json) as Array<{
    files?: Array<{ path: string }>
  }>
  for (const pr of prs) {
    for (const file of pr.files ?? []) {
      files.add(file.path)
    }
  }
  return files
}

export function createBranchFromMain(branch: string) {
  git(['fetch', 'origin', 'main'])
  git(['checkout', '-B', branch, 'origin/main'])
}

export function commitAll(message: string) {
  git(['add', '-A'])
  git(['commit', '-m', message])
}

export function pushBranch(branch: string) {
  git(['push', '-u', 'origin', branch])
}

export function createPullRequest(input: {
  title: string
  body: string
  branch: string
  base?: string
}): string {
  return gh([
    'pr',
    'create',
    '--base',
    input.base ?? 'main',
    '--head',
    input.branch,
    '--title',
    input.title,
    '--body',
    input.body,
  ])
}
