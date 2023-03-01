import { Hooks } from '@/hooks'
import { fatal, findGitRoot, readConfig } from '@/utils'

export default async function () {
  const root = findGitRoot()
  const config = readConfig(root)
  if (!config) {
    return fatal('Please initialize okpush in this repository first.')
  }
  const hooks = new Hooks(root)
  hooks.initAllHooks()
}
