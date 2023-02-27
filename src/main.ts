import { program } from 'commander'

import { log, setVerbose } from '@/logger'

export default function () {
  program
    .name('okpush')
    .description('git hook management tool')
    .option('-v, --verbose', 'verbose logging', () => setVerbose(1))

  program
    .command('init')
    .description('Initialize okpush in a git repo')
    .argument('<email>', 'Your okpush email address. If ommitted, your git identity will be used.')
    .action((email: string) => {
      console.log('doing init', email)
    })
  program.parse()

  const errorHandler = (e: any) => {
    log(e.toString())
    process.exit(1)
  }
}
