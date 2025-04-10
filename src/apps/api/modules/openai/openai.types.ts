export interface IToken {
  id: string
  blockTimestamp: string
  initialAmount: string
  name: string
  ticker: string
  owner: string
  token_address: string
}

export interface IVesting {
  id: string
  blockTimestamp: string
  token_address: string
  token_name: string
  token_ticker: string
  owner: string
  amount: string
  total_periods: number
  period_duration: number
  start_timestamp: string
  base_address: string | null
}

export interface IJsonState {
  isCapturingJson: boolean
  jsonBuffer: string
  openBraces: number
  closeBraces: number
  visibleText: string
}
