import api from '@/api'
import { gitBranch, gitShow } from '@/git'
import { verboseLog } from '@/logger'
import { readConfig, unwrapError } from '@/utils'

export default async function () {
  const config = readConfig()
  if (!config) return

  const result = await gitShow()
  const branch = await gitBranch()

  try {
    await Promise.all(
      Object.keys(config.remotes).map(async (remote) => {
        const secret = config.remotes[remote].secret
        const repo = { repo: remote, secret }
        return api.sendCommit(repo, { ...result, branch })
      })
    )
  } catch (e) {
    verboseLog(unwrapError(e))
  }
}
