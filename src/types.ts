export type ProjectConfig = {
  server?: string

  remotes: {
    [remote: string]: {
      secret: string
    }
  }
}
