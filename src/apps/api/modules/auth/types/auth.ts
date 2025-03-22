export type TAuthResult = {
  user: any
}

export type PrivyAuthParams = {
  email?: string
  phone?: string
  defaultWalletAddress: string
  injectedWalletAddress?: string[]
  twitterUserName?: string
}
