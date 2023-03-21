import fs from 'fs'

import api from '@/api'
import { git, gitBranch, gitShow } from '@/git'
import { verboseLog } from '@/logger'
import { nohup, readConfig, unwrapError } from '@/utils'

type Options = {
  async?: boolean
  timeout?: string
}

export default async function (opts: Options) {
  if (!opts.async) {
    await postCommitSync(opts)
  } else {
    await postCommitAsync()
  }
}

const SYNC_REQ_TIMEOUT = 1000

// execute post-commit handler if run from a tty. this will attempt to contact
// okpush server, but any slow-running jobs will be run in background
async function postCommitSync(opts: Options) {
  const timeout = opts.timeout ? parseInt(opts.timeout) : SYNC_REQ_TIMEOUT

  try {
    await runPostCommitHook(timeout, (command) => {
      const stringCommand = 'git ' + command.join(' ')
      verboseLog(`nohup: ${stringCommand}`)
      nohup(stringCommand)
    })
  } catch (e) {
    verboseLog(unwrapError(e))
    runAsync()
  }
}

function runAsync() {
  const command = process.argv.map((p) => (p.includes(' ') ? `"${p}"` : p)).join(' ') + ' --async'
  verboseLog(`nohup: ${command}`)
  nohup(command)
}

async function postCommitAsync() {
  try {
    await runPostCommitHook(undefined, (command) => {
      git(command)
    })
  } catch (e) {
    fs.writeFileSync('/tmp/okpush.log', 'post-commit error: ' + unwrapError(e))
  }
}

async function runPostCommitHook(timeout: number | undefined, onPush: (command: string[]) => void) {
  const config = readConfig()
  if (!config) return
  const result = gitShow()
  const branch = gitBranch()

  await Promise.any(
    Object.keys(config.remotes).map(async (remote) => {
      const secret = config.remotes[remote].secret
      const repo = { repo: remote, secret }
      return api.sendCommit(repo, branch, result, timeout).then((response) => {
        if (response.message) {
          console.log(response.message)
        }

        if (response.sync_url) {
          verboseLog(`Sync URL: ${response.sync_url}`)
          const syncBranch = `okpush/${result.email}/${branch}`
          let pushUrl
          if (remote.startsWith('git@')) {
            pushUrl = `git@${response.sync_url}`
          } else {
            pushUrl = `https://${response.sync_url.replace(':', '/')}`
          }

          const command = ['push', '--no-verify', '-f', pushUrl, `HEAD:${syncBranch}`]
          onPush(command)
        }
      })
    })
  )
}
