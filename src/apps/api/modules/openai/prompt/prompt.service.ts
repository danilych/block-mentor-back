import { Injectable } from '@nestjs/common'
import { basicPrompt } from 'src/common/constants/basicPrompt'
import { IToken, IVesting } from '../openai.types'

@Injectable()
export class PromptService {
  formatUserDataForPrompt(
    tokens: IToken[],
    vestings: IVesting[],
    walletAddress: string
  ): string {
    let userDataPrompt = '\n\nUSER DATA:\n'

    if (tokens.length > 0) {
      userDataPrompt += '\nUser Tokens:\n'
      tokens.forEach(token => {
        userDataPrompt += `- Name: ${token.name} (${token.ticker})\n  Address: ${token.token_address}\n  Amount: ${token.initialAmount}\n\n`
      })
    } else {
      userDataPrompt += '\nUser has no tokens.\n'
    }

    if (vestings.length > 0) {
      userDataPrompt += '\nUser Vestings:\n'
      vestings.forEach(vesting => {
        userDataPrompt += `- Token: ${vesting.token_name} (${vesting.token_ticker})\n  Address: ${vesting.token_address}\n  Amount: ${vesting.amount}\n  Periods: ${vesting.total_periods} x ${vesting.period_duration}s\n  Start: ${vesting.start_timestamp}\n\n`
      })
    } else {
      userDataPrompt += '\nUser has no vestings.\n'
    }

    userDataPrompt += `\nUser Wallet Address: ${walletAddress}\n`

    return userDataPrompt
  }

  getCompleteChatPrompt(
    userPrompt: string,
    userDataPrompt: string
  ): Array<{ role: string; content: string }> {
    return [
      {
        role: 'user',
        content: userPrompt,
      },
      {
        role: 'developer',
        content: basicPrompt + '\n\n' + userDataPrompt,
      },
    ]
  }
}
