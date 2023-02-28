import fs from 'fs'
import path from 'path'

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

  constructor(gitDir: string) {
    this.gitDir = gitDir
    this.hookPath = path.join(gitDir, 'hooks')

    // hook path can be overwritten by config
    const overriddenPath = git(gitDir, ['config', 'core.hooksPath'])
    if (overriddenPath.length) {
      this.hookPath = overriddenPath
      verboseLog('Custom hook path:', this.hookPath)
    }
  }

  getHook(type: HookType) {
    if (!this.hookPath) throw 'hooks not initialized'
    const file = path.join(this.hookPath, type)
    return file
  }

  createHook(type: HookType, action: string) {
    const file = this.getHook(type)
    verboseLog('Creating hook:', file)

    if (fs.existsSync(file)) {
      const contents = fs.readFileSync(file, 'utf-8')
      if (contents.includes(action)) return
      else if (action.includes('okpush')) throw 'unknown okpush content detected in hook ' + type
      return
    }

    const contents = `#!/bin/sh

    ${action}
    `
    fs.writeFileSync(file, contents)
  }

  initAllHooks(okpushCommand: string) {
    const supported: HookType[] = [
      'pre-commit',
      'post-commit',
      'post-checkout',
      'pre-push',
      'post-rewrite',
    ]
    for (const hook of supported) {
      const command = `${okpushCommand} ${hook}`
      this.createHook(hook, command)
    }
  }
}
