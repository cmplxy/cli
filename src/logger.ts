import chalk from 'chalk'

let verbosity = 0

const VERBOSE = 1
const VERY_VERBOSE = 2

const TAG = chalk.blue('[logger]')

export function setVerbose(setting: number) {
  log(TAG, 'verbose logging:', setting)
  verbosity = setting
}

export function isVerbose() {
  return verbosity >= VERBOSE
}

export function isVeryVerbose() {
  return verbosity >= VERY_VERBOSE
}

export function verboseLog(...args: any[]) {
  if (!isVerbose()) return
  console.log(...args)
}

export function veryVerboseLog(...args: any[]) {
  if (!isVeryVerbose()) return
  console.log(...args)
}

export function log(...args: any[]) {
  console.log(...args)
}
