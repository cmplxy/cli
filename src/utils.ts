import crypto from 'crypto'
import fs from 'fs'
import path from 'path'

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

export function fatal(...args: any[]) {
  console.error(...args)
  process.exit(1)
}
