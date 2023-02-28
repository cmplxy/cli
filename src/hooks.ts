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
      else if (action.includes('okpush')) throw 'unknown okpush content detected in hook ' + type
      return
    }

    verboseLog('Creating hook:', file)
    const contents = `#!/bin/sh\n\n${action}`
    fs.writeFileSync(file, contents)
    fs.chmodSync(file, '755')
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
