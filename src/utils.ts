import { isAxiosError } from 'axios'
import chalk from 'chalk'
import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

import api from '@/api'
import { overrideServer } from '@/config'
import { ProjectConfig } from '@/types'

// walk up the tree until we find the .git folder
export function findGitRoot() {
  let dir = process.cwd()
  while (dir !== '/') {
    if (fs.existsSync(path.join(dir, '.git'))) return dir
    dir = path.dirname(dir)
  }
  throw new Error('Could not find git root')
}

// generate secret key
export function generateSecretKey() {
  return crypto
    .randomBytes(48)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')
}

export function readConfig(root: string = findGitRoot()): ProjectConfig | null {
  const configPath = path.join(root, '.okpush')
  if (!fs.existsSync(configPath)) {
    return null
  }

  const data = fs.readFileSync(configPath, 'utf-8')
  const config: ProjectConfig = JSON.parse(data)
  if (config.server) overrideServer(config.server)
  return config
}

export function unwrapError(e: any): string {
  if (isAxiosError(e)) {
    return api.unwrapError(e)
  } else if (e instanceof Error) {
    return e.message
  } else {
    return e.toString()
  }
}

export function logErrorMessage(e: any) {
  if (isAxiosError(e)) {
    error(api.unwrapError(e))
  } else {
    error(e)
  }
}

export function error(...args: any[]) {
  console.error(chalk.red('Error:'), ...args)
}

export function fatal(...args: any[]) {
  console.error(chalk.red('Fatal:'), ...args)
  process.exit(1)
}
