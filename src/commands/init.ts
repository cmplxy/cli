import chalk from 'chalk'
import fs from 'fs'
import ini from 'ini'
import inquirer from 'inquirer'
import path from 'path'

import api from '@/api'
import config from '@/config'
import { git } from '@/git'
import { Hooks } from '@/hooks'
import { log, verboseLog } from '@/logger'
import { ProjectConfig } from '@/types'
import { fatal, findGitRoot, generateSecretKey, logErrorMessage, readConfig } from '@/utils'

type Options = {
  force?: boolean
}

export default async function (email: string, options: Options) {
  const root = findGitRoot()
  verboseLog('Initializing in', root, options)

  const existingConfig = readConfig(root)

  if (!existingConfig) {
    await registerRepo(email, root, path.join(root, '.okpush'))
  } else if (options.force) {
    await Promise.all(
      Object.keys(existingConfig.remotes).map((remote) =>
        api.initRepo(email, remote, existingConfig.remotes[remote].secret)
      )
    )
  } else {
    verboseLog('Config file already exists, skipping registration')
  }

  const hooks = new Hooks(root)
  hooks.initAllHooks()

  log(chalk.yellowBright(`\nPlease return to the okpush website for next steps.`))
}

async function registerRepo(email: string, root: string, configPath: string) {
  const gitConfig = ini.parse(fs.readFileSync(path.join(root, '.git', 'config'), 'utf-8'))

  const remoteSections = Object.keys(gitConfig).filter((key) => key.startsWith('remote '))
  if (remoteSections.length === 0) {
    return fatal('No remotes configured for this .git repository. Please add one and try again.')
  }

  // determin the origin
  let origin: string | undefined
  if (remoteSections.length > 1) {
    const { remote } = await inquirer.prompt([
      {
        type: 'list',
        name: 'remote',
        message: 'Select primary repository your team uses to collaborate:',
        choices: remoteSections.map((section) => gitConfig[section].url),
      },
    ])
    origin = remote
  } else {
    origin = gitConfig[remoteSections[0]].url
  }

  if (!origin) return fatal('No remote specified')

  const secret = generateSecretKey()
  const initialConfig: ProjectConfig = {
    remotes: {
      [origin]: {
        secret,
      },
    },
  }

  if (config.customServer) initialConfig.server = config.server

  // attempt to register with the server
  try {
    await api.initRepo(email, origin, secret)
    fs.writeFileSync(configPath, JSON.stringify(initialConfig))
    git(['add', configPath])
    log(`Repository was initialized, and a config file was generated in ${configPath}.`)
    log(`Remember to commit the config file to your repo.`)
  } catch (e) {
    logErrorMessage(e)
  }
}
