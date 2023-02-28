import axios, { AxiosError } from 'axios'

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
