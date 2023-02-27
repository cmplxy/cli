import { spawnSync } from 'child_process'

export function git(args: string[]) {
  const result = spawnSync(`git`, args, {
    encoding: 'utf-8',
  })

  if (result.error) throw result.error
  return result.stdout.trim()
}
