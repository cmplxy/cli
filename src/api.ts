import axios from 'axios'

import config from '@/config'

export type SuccessResponse = {
  success: true
}

export type ErrorResponse = {
  success: false
  error: string
}

class API {
  async initRepo(email: string, repo: string, secret: string): Promise<SuccessResponse> {
    return await axios.post(`${config.server}/git/init`, { email, repo, secret })
  }
}

export default new API()
