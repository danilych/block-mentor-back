import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { Job } from 'bull'
import { ethers } from 'ethers'
import { TOKEN_FACTORY_ABI } from 'src/common/abi/token-factory-abi'
import { arbitrumSepolia } from 'src/common/constants/chains'
import { arbitrumTokenFactoryAddress } from 'src/common/constants/contractDeployments'
import { CREATE_TOKEN } from 'src/common/constants/queues'

interface TokenComponents {
  name: string
  symbol: string
  initialSupply: string
  userWalletAddress: string
}

interface AppConfig {
  privyId: string
  privySecret: string
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
      components?: TokenComponents
      [key: string]: any
    }>
  ) {
    try {
      const data = job.data as TokenComponents

      this.logger.log(
        `Creating token: ${data.name} (${data.symbol}) with supply ${data.initialSupply}`
      )

      // Create interface from ABI for encoding function data
      const tokenFactoryInterface = new ethers.Interface(TOKEN_FACTORY_ABI)

      // Encode the function call with parameters
      const encodedData = tokenFactoryInterface.encodeFunctionData(
        'createToken',
        [data.name, data.symbol, ethers.parseUnits(data.initialSupply, 18)]
      )

      const signedTransaction =
        await this.privy.walletApi.ethereum.sendTransaction({
          address: '0xe70aA1ced6C4bb44a7Edb4eEc527D67050d6cC19',
          chainType: 'ethereum',
          caip2: `eip155:${arbitrumSepolia}`,
          transaction: {
            value: Number(0),
            chainId: arbitrumSepolia,
            to: arbitrumTokenFactoryAddress,
            data: encodedData,
          },
        })

      this.logger.log('Token creation transaction signed successfully')
      this.logger.log('Create token job finished, proceed action...')
      return { success: true, data }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Error creating token: ${errorMessage}`)

      if (job.attemptsMade === 3) {
        this.logger.error('Max attempts reached, abandoning job')
      }
      throw error
    }
  }
}
