import postCommit from '@/commands/post-commit'

export default async function () {
  await postCommit()
}
