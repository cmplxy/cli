import { program } from 'commander'

import init from '@/commands/init'
import install from '@/commands/install'
import postCheckout from '@/commands/post-checkout'
import postCommit from '@/commands/post-commit'
import postRewrite from '@/commands/post-rewrite'
import preCommit from '@/commands/pre-commit'
import prePush from '@/commands/pre-push'
import config, { overrideServer } from '@/config'
import { setVerbose } from '@/logger'

export default function () {
  program
    .name('okpush')
    .description('git hook management tool')
    .option('-v, --verbose', 'verbose logging', () => setVerbose(1))
    .option('--server <server>', 'specify a custom okpush server', overrideServer)

  program
    .command('init')
    .description('Initialize okpush in a git repo')
    .argument('<email>', 'Your okpush email address. If ommitted, your git identity will be used.')
    .option('--force', 'Force re-initialization of the repo')
    .action(init)

  program.command('install').description('Install git hooks if not installed.').action(install)

  const hookOpts = { hidden: true }
  program.command('post-checkout', hookOpts).action(postCheckout)

  program.command('post-commit', hookOpts).action(postCommit)

  program.command('post-rewrite', hookOpts).action(postRewrite)

  program.command('pre-commit', hookOpts).action(preCommit)

  program.command('pre-push', hookOpts).action(prePush)

  const options = program.parse()
  config.options = options
}
