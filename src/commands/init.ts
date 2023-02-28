import fs from 'fs'
import ini from 'ini'
import inquirer from 'inquirer'
import path from 'path'

import api from '@/api'
import config from '@/config'
import { Hooks } from '@/hooks'
import { log, verboseLog } from '@/logger'
import { ProjectConfig } from '@/types'
import { fatal, findGitRoot, generateSecretKey, logErrorMessage } from '@/utils'

export default async function (email: string) {
  const root = findGitRoot()
  verboseLog('Initializing in', root)

  const configPath = path.join(root, '.okpush')

  if (!fs.existsSync(configPath)) {
    await registerRepo(email, root, configPath)
  } else {
    verboseLog('Config file already exists, skipping registration')
  }

  const hooks = new Hooks(root)
  const okpushCommand = process.argv.slice(0, 2).join(' ')

  verboseLog('Installing hooks with command', okpushCommand)
  hooks.initAllHooks(okpushCommand)

  log(`Return to the website for instructions.`)
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
    log(`Repository was initialized, and a config file was generated in ${configPath}.`)
    log(`Remember to commit the config file to your repo.`)
  } catch (e) {
    logErrorMessage(e)
  }
}
