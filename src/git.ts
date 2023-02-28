import { spawnSync } from 'child_process'

export function git(args: string[], cwd?: string) {
  const result = spawnSync(`git`, args, {
    cwd,
    encoding: 'utf-8',
  })

  if (result.error) throw result.error
  return result.stdout.trim()
}

type FilesMap = { [file: string]: string }

export type GitShowData = {
  hash: string
  author: string
  email: string
  refs: string
  parents: string[]
  message: string
  files: FilesMap
}

export function gitShow(cwd?: string): GitShowData {
  const format = [
    '%H', // commit hash
    '%an', // author name
    '%ae', // author email
    '%d', // ref names
    '%P', // parent hashes
    '%B', // commit message
  ].join('%n')
  const response = git(['show', '--stat', '--format=' + format], cwd)
  const lines = response.split('\n')

  const [hash, author, email, refs, parents, ...messageStats] = lines

  const separator = messageStats.lastIndexOf('')

  const message = messageStats.slice(0, separator)
  const fileStats = messageStats.slice(separator + 1).map((s) => s.trim())

  const files: FilesMap = {}
  fileStats.forEach((stat) => {
    const [file, data] = stat.split(' | ', 2).map((s) => s.trim())
    if (!data) return
    files[file] = data
  })

  return {
    hash,
    author,
    email,
    refs,
    parents: parents.split(' '),
    message: message.join('\n').trim(),
    files,
  }
}

export function gitBranch(cwd?: string): string {
  try {
    const response = git(['symbolic-ref', '--short', 'HEAD'], cwd)
    return response
  } catch (e) {
    // detached head
    return ''
  }
}
