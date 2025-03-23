import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { Job } from 'bull'
import { ethers } from 'ethers'
import { ERC20_ABI } from 'src/common/abi/erc20-abi'
import { VESTING_FACTORY_ABI } from 'src/common/abi/vesting-factory-abi'
import { arbitrumSepolia } from 'src/common/constants/chains'
import {
  arbitrumTokenFactoryAddress,
  arbitrumVestingFactoryAddress,
} from 'src/common/constants/contractDeployments'
import { CREATE_VESTING } from 'src/common/constants/queues'

interface VestingComponents {
  userWalletAddress: string
  tokenAddress: string
  startTimestamp: string
  periodDurationInSeconds: string
  totalPeriods: string
  totalAmount: string
}

interface AppConfig {
  privyId: string
  privySecret: string
}

@Processor({ name: CREATE_VESTING })
export class CreateVestingService {
  private readonly logger = new Logger(CreateVestingService.name)
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
      components?: VestingComponents
      [key: string]: any
    }>
  ) {
    try {
      const data = job.data as VestingComponents

      this.logger.log(
        `Creating vesting for token at address ${data.tokenAddress}`
      )

      console.log(ethers.parseUnits(data.totalAmount, 18))

      // Create interface from ABI for encoding function data
      const tokenFactoryInterface = new ethers.Interface(ERC20_ABI)
      const encodedApproveData = tokenFactoryInterface.encodeFunctionData(
        'approve',
        [arbitrumVestingFactoryAddress, ethers.parseUnits(data.totalAmount, 18)]
      )
      await this.privy.walletApi.ethereum.sendTransaction({
        address: '0xe70aA1ced6C4bb44a7Edb4eEc527D67050d6cC19',
        chainType: 'ethereum',
        caip2: `eip155:${arbitrumSepolia}`,
        transaction: {
          value: Number(0),
          chainId: arbitrumSepolia,
          to: data.tokenAddress,
          data: encodedApproveData,
        },
      })

      console.log(data);

      const vestingFactoryInterface = new ethers.Interface(VESTING_FACTORY_ABI)
      // Encode the function call with parameters
      const encodedData = vestingFactoryInterface.encodeFunctionData(
        'createVestingContractWithSchedule',
        [
          data.tokenAddress,
          '0xe70aA1ced6C4bb44a7Edb4eEc527D67050d6cC19',
          data.startTimestamp,
          data.periodDurationInSeconds,
          data.totalPeriods,
          data.totalAmount,
        ]
      )

      console.log(encodedData)

      const signedTransaction =
        await this.privy.walletApi.ethereum.sendTransaction({
          address: '0xe70aA1ced6C4bb44a7Edb4eEc527D67050d6cC19',
          chainType: 'ethereum',
          caip2: `eip155:${arbitrumSepolia}`,
          transaction: {
            value: Number(0),
            chainId: arbitrumSepolia,
            to: arbitrumVestingFactoryAddress,
            data: encodedData,
          },
        })

      this.logger.log('Vesting creation transaction signed successfully')
      this.logger.log('Create vesting job finished, proceed action...')
      return { success: true, data }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      this.logger.error(`Error creating vesting: ${errorMessage}`)

      if (job.attemptsMade === 3) {
        this.logger.error('Max attempts reached, abandoning job')
      }
      throw error
    }
  }
}
