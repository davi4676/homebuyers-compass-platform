declare module 'web-push' {
  const webpush: {
    setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void
    sendNotification: (
      subscription: unknown,
      payload: string | Buffer,
      options?: unknown
    ) => Promise<unknown>
  }
  export default webpush
}
