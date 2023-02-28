import { spawnSync } from 'child_process'

export function git(cwd: string, args: string[]) {
  const result = spawnSync(`git`, args, {
    cwd,
    encoding: 'utf-8',
  })

  if (result.error) throw result.error
  return result.stdout.trim()
}
