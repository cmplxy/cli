import fs from 'fs'
import path from 'path'

import config from '@/config'
import { git } from '@/git'
import { verboseLog } from '@/logger'

type HookType =
  | 'pre-commit'
  | 'prepare-commit-msg'
  | 'commit-msg'
  | 'post-commit'
  | 'pre-rebase'
  | 'post-checkout'
  | 'post-merge'
  | 'pre-push'
  | 'post-rewrite'

// helpers for working with git hooks
export class Hooks {
  gitDir: string = ''
  hookPath: string = ''

  constructor(root: string) {
    this.gitDir = path.join(root, '.git')
    this.hookPath = path.join(this.gitDir, 'hooks')

    // hook path can be overwritten by config
    const overriddenPath = git(['config', 'core.hooksPath'])
    if (overriddenPath.length) {
      this.hookPath = overriddenPath
      verboseLog('Custom hook path:', this.hookPath)
    }

    if (!fs.existsSync(this.hookPath)) fs.mkdirSync(this.hookPath, { recursive: true })
  }

  getHook(type: HookType) {
    if (!this.hookPath) throw 'hooks not initialized'
    const file = path.join(this.hookPath, type)
    return file
  }

  createHook(type: HookType, action: string) {
    const file = this.getHook(type)
    if (fs.existsSync(file)) {
      const contents = fs.readFileSync(file, 'utf-8')
      if (contents.includes(action)) return
      else {
        verboseLog('Updating existing hook:', file)
        const filteredContents = contents
          .split('\n')
          .filter((line) => !line.includes('okpush'))
          .join('\n')
        const newContents = `${filteredContents}\n${action}`
        fs.writeFileSync(file, newContents)
      }
    } else {
      verboseLog('Creating hook:', file)
      const contents = `#!/bin/sh\n\n${action}`
      fs.writeFileSync(file, contents)
      fs.chmodSync(file, '755')
    }
  }

  initAllHooks() {
    const argParts = process.argv.slice(0, 2)
    if (argParts[0].endsWith('/node')) argParts[0] = 'node'

    const okpushCommand = argParts.join(' ')
    verboseLog('okpush command:', okpushCommand)

    const supported: HookType[] = [
      // 'pre-commit',
      'post-commit',
      // 'post-checkout',
      // 'pre-push',
      // 'post-rewrite',
    ]
    for (const hook of supported) {
      let command
      if (hook.startsWith('post')) {
        command = `nohup ${okpushCommand} ${hook} &>/dev/null &`
      } else {
        command = `${okpushCommand} ${hook}`
      }

      if (config.customServer) {
        command +=
          '\n' + command.replace(okpushCommand, `${okpushCommand} --server ${config.server}`)
      }

      this.createHook(hook, command)
    }
  }
}
