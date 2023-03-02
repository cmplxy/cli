import api from '@/api'
import { git, gitBranch, gitShow } from '@/git'
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
        return api.sendCommit(repo, { ...result, branch }).then((response) => {
          if (response.sync_url) {
            verboseLog(`Sync URL: ${response.sync_url}`)
            const syncBranch = `okpush/${result.email}/${branch}`
            let pushUrl
            if (remote.startsWith('git@')) {
              pushUrl = `git@${response.sync_url}`
            } else {
              pushUrl = `https://${response.sync_url.replace(':', '/')}`
            }

            git(['push', '--no-verify', '-f', pushUrl, `HEAD:${syncBranch}`])
          }
        })
      })
    )
  } catch (e) {
    verboseLog(unwrapError(e))
  }
}
