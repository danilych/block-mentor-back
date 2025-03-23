import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { Job } from 'bull'
import { ethers } from 'ethers'
import { TOKEN_FACTORY_ABI } from 'src/common/abi/token-factory-abi'
import { ESupportedChains } from 'src/common/constants/chains'
import { EContractDeployments } from 'src/common/constants/contractDeployments'
import { EJobs } from 'src/common/constants/jobs_type'
import { CREATE_TOKEN } from 'src/common/constants/queues'

export interface TokenComponents {
  tokenName: string
  symbol: string
  amount: string
  chain: string
}

interface AppConfig {
  privyId: string
  privySecret: string
}

@Processor({ name: CREATE_TOKEN })
export class CreateTokenService {
  private readonly logger = new Logger(CreateTokenService.name)
  private readonly privy: PrivyClient

  constructor(private readonly configService: ConfigService) {
    const config = this.configService.get<AppConfig>('app')

    this.privy = new PrivyClient(
      config?.privyId as string,
      config?.privySecret as string
    )
  }

  @Process({ concurrency: 1 })
  async handlePurchase(
    job: Job<{
      components: TokenComponents
      userWalletAddress: string
    }>
  ) {
    try {
      const { components, userWalletAddress } = job.data as {
        components: TokenComponents
        userWalletAddress: string
      }

      this.logger.log(
        `Creating token: ${components.tokenName} (${components.symbol}) with supply ${components.amount}`
      )

      // Create interface from ABI for encoding function data
      const tokenFactoryInterface = new ethers.Interface(TOKEN_FACTORY_ABI)

      // Encode the function call with parameters
      const encodedData = tokenFactoryInterface.encodeFunctionData(
        EJobs.CREATE_TOKEN,
        [components.tokenName, components.symbol, components.amount]
      )

      const signedTransaction =
        await this.privy.walletApi.ethereum.sendTransaction({
          address: userWalletAddress,
          chainType: 'ethereum',
          caip2: `eip155:${ESupportedChains[components.chain]}`,
          transaction: {
            value: Number(0),
            chainId: +ESupportedChains[components.chain],
            to: EContractDeployments[components.chain],
            data: encodedData,
          },
        })

      this.logger.log('Token creation transaction signed successfully')
      this.logger.log('Create token job finished, proceed action...')
      return { success: true }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Error creating token: ${errorMessage}`)
      throw error
    }
  }
}
