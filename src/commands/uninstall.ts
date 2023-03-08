import { Hooks } from '@/hooks'
import { fatal, findGitRoot, readConfig } from '@/utils'

export default async function () {
  const root = findGitRoot()
  const hooks = new Hooks(root)
  hooks.uninstallHooks()
}
