import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { Job } from 'bull'
import { ethers } from 'ethers'
import { TOKEN_FACTORY_ABI } from 'src/common/abi/token-factory-abi'
import { arbitrumSepolia } from 'src/common/constants/chains'
import { arbitrumTokenFactoryAddress } from 'src/common/constants/contractDeployments'
import { EJobs } from 'src/common/constants/jobs_type'
import { CREATE_TOKEN } from 'src/common/constants/queues'

export interface TokenComponents {
  name: string
  symbol: string
  initialSupply: string
  network: string
}

interface AppConfig {
  privyId: string
  privySecret: string
}

enum ESupportedChains {
  arbitrum = '421614',
  base = '84532',
}

@Processor({ name: CREATE_TOKEN })
export class CreateTokenService {
  private readonly logger = new Logger(CreateTokenService.name)
  private readonly privy: PrivyClient
  private readonly tokenFactoryAddress = '0xYourTokenFactoryAddress' // Replace with actual contract address

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
        `Creating token: ${components.name} (${components.symbol}) with supply ${components.initialSupply}`
      )

      // Create interface from ABI for encoding function data
      const tokenFactoryInterface = new ethers.Interface(TOKEN_FACTORY_ABI)

      // Encode the function call with parameters
      const encodedData = tokenFactoryInterface.encodeFunctionData(
        EJobs.CREATE_TOKEN,
        [components.name, components.symbol, components.initialSupply]
      )

      const signedTransaction =
        await this.privy.walletApi.ethereum.sendTransaction({
          address: userWalletAddress,
          chainType: 'ethereum',
          caip2: `eip155:${arbitrumSepolia}`,
          transaction: {
            value: Number(0),
            chainId: ESupportedChains[components.network],
            to: arbitrumTokenFactoryAddress,
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
