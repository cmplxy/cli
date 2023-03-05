import axios, { AxiosError } from 'axios'

import config from '@/config'
import { GitLogData, GitShowData } from '@/git'

export type SuccessResponse = {
  success: true
}

export type ErrorResponse = {
  success: false
  error: string
}

type RepoData = {
  repo: string
  secret: string
}

class API {
  async initRepo(uuid: string, repo: string, secret: string): Promise<SuccessResponse> {
    const response = await axios.post(`${config.server}/git/init`, { uuid, repo, secret })
    return response.data
  }

  async sendCommit(
    repo: RepoData,
    branch: string,
    data: GitShowData
  ): Promise<{ sync_url?: string }> {
    const response = await axios.post(`${config.server}/git/commit`, { branch, ...repo, ...data })
    return response.data
  }

  async syncCommits(repo: RepoData, commits: GitLogData[]): Promise<SuccessResponse> {
    const response = await axios.post(`${config.server}/git/sync`, { ...repo, commits })
    return response.data
  }

  // --- error handling

  unwrapError(error: AxiosError): string {
    if (error.response) {
      return (error.response.data as ErrorResponse).error
    } else if (error.request) {
      return 'No response from server'
    } else {
      return error.message
    }
  }
}

export default new API()
