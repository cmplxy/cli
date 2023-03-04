import api from '@/api'
import { gitLog } from '@/git'
import { Hooks } from '@/hooks'
import { log, verboseLog } from '@/logger'
import { fatal, findGitRoot, logErrorMessage, readConfig, unwrapError } from '@/utils'

type Options = {
  since?: string
  count?: string
  internal?: boolean
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
  if (!commits.length && !options.internal) return fatal('No commits to sync.')

  try {
    // sync in batches of 500
    const batchSize = 500
    for (let i = 0; i < commits.length; i += batchSize) {
      const batch = commits.slice(i, i + batchSize)
      if (batch.length < batchSize) log(`Syncing ${batch.length} commits...`)
      else log(`Syncing ${i + batchSize} of ${commits.length} commits...`)

      await Promise.all(
        Object.keys(config.remotes).map(async (remote) => {
          const secret = config.remotes[remote].secret
          const repo = { repo: remote, secret }
          return api.syncCommits(repo, batch)
        })
      )
    }
  } catch (e) {
    logErrorMessage(e)
  }
}
