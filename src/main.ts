import { program } from 'commander'

import init from '@/commands/init'
import config from '@/config'
import { setVerbose } from '@/logger'

export default function () {
  program
    .name('okpush')
    .description('git hook management tool')
    .option('-v, --verbose', 'verbose logging', () => setVerbose(1))
    .option(
      '--server <server>',
      'specify a custom okpush server',
      (server) => (config.server = server)
    )

  program
    .command('init')
    .description('Initialize okpush in a git repo')
    .argument('<email>', 'Your okpush email address. If ommitted, your git identity will be used.')
    .action(init)
  program.parse()
}
