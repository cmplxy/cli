import { program } from 'commander'

import init from '@/commands/init'
import install from '@/commands/install'
import postCheckout from '@/commands/post-checkout'
import postCommit from '@/commands/post-commit'
import postRewrite from '@/commands/post-rewrite'
import postinstall from '@/commands/postinstall'
import preCommit from '@/commands/pre-commit'
import prePush from '@/commands/pre-push'
import sync from '@/commands/sync'
import config, { overrideServer } from '@/config'
import { log, setVerbose } from '@/logger'
import { fatal } from '@/utils'

import packageJson from '../package.json'

export default function () {
  program
    .name('okpush')
    .description('git hook management tool')
    .option('-v, --verbose', 'verbose logging', () => setVerbose(1))
    .option('--server <server>', 'specify a custom okpush server', overrideServer)
    .option('--version', 'print version', () => {
      log(packageJson.version)
      process.exit(0)
    })

  program
    .command('init')
    .description('Initialize okpush in a git repo')
    .argument('<user>', 'Your okpush user id.')
    .option('--force', 'Force re-registration of the repo')
    .action(actionWrapper(init))

  program
    .command('install')
    .description('Install git hooks if not installed.')
    .action(actionWrapper(install))

  program
    .command('sync')
    .description('Sync past git history to okpush. Defaults to last 100 commits.')
    .option('-s, --since <date>', 'sync all history since date')
    .option('-c, --count <count>', 'sync last n commits')
    .action(actionWrapper(sync))

  const hookOpts = { hidden: true }
  program.command('post-checkout', hookOpts).action(actionWrapper(postCheckout))

  program.command('post-commit', hookOpts).action(actionWrapper(postCommit))

  program.command('post-rewrite', hookOpts).action(actionWrapper(postRewrite))

  program.command('pre-commit', hookOpts).action(actionWrapper(preCommit))

  program.command('pre-push', hookOpts).action(actionWrapper(prePush))

  program.command('postinstall', hookOpts).action(actionWrapper(postinstall))

  const options = program.parse()
  config.options = options
}

function actionWrapper(fn: (...args: any[]) => Promise<any>) {
  return (...args: any[]) => fn(...args).catch(fatal)
}
