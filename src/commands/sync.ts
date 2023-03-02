import api from '@/api'
import { gitLog } from '@/git'
import { Hooks } from '@/hooks'
import { log, verboseLog } from '@/logger'
import { fatal, findGitRoot, logErrorMessage, readConfig, unwrapError } from '@/utils'

type Options = {
  since?: string
  count?: string
}

export default async function (options: Options) {
  const root = findGitRoot()
  const config = readConfig(root)
  if (!config) {
    return fatal('Please initialize okpush in this repository first.')
  }

  const args = []
  if (options.since) {
    args.push('--since', options.since)
  }
  if (options.count) {
    args.push('-n', options.count)
  }
  if (!args.length) {
    args.push('-n 100')
  }

  const commits = gitLog(root, ...args)
  log(`Syncing ${commits.length} commits...`)

  try {
    await Promise.all(
      Object.keys(config.remotes).map(async (remote) => {
        const secret = config.remotes[remote].secret
        const repo = { repo: remote, secret }
        return api.syncCommits(repo, commits)
      })
    )
  } catch (e) {
    logErrorMessage(e)
  }
}
