import { Processor, Process } from '@nestjs/bull'
import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrivyClient } from '@privy-io/server-auth'
import { Job } from 'bull'
import { ethers } from 'ethers'
import { ERC20_ABI } from 'src/common/abi/erc20-abi'
import { VESTING_FACTORY_ABI } from 'src/common/abi/vesting-factory-abi'
import { ESupportedChains } from 'src/common/constants/chains'
import { ETokenFactoryDeployments } from 'src/common/constants/contractDeployments'

import { CREATE_VESTING } from 'src/common/constants/queues'

interface VestingComponents {
  tokenAddress: string
  startTimestamp: string
  periodDurationInSeconds: string
  totalPeriods: string
  totalAmount: string
  chain: string
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
      components: VestingComponents
      userWalletAddress: string
    }>
  ) {
    try {
      const { components, userWalletAddress } = job.data as {
        components: VestingComponents
        userWalletAddress: string
      }

      this.logger.log(
        `Creating vesting for token at address ${components.tokenAddress}`
      )

      console.log(ethers.parseUnits(components.totalAmount, 18))

      // Create interface from ABI for encoding function data
      const tokenFactoryInterface = new ethers.Interface(ERC20_ABI)
      const encodedApproveData = tokenFactoryInterface.encodeFunctionData(
        'approve',
        [
          ETokenFactoryDeployments[components.chain],
          ethers.parseUnits(components.totalAmount, 18),
        ]
      )
      await this.privy.walletApi.ethereum.sendTransaction({
        address: userWalletAddress,
        chainType: 'ethereum',
        caip2: `eip155:${ESupportedChains[components.chain]}`,
        transaction: {
          value: Number(0),
          chainId: ESupportedChains[components.chain],
          to: components.tokenAddress,
          data: encodedApproveData,
        },
      })

      console.log(components)

      const vestingFactoryInterface = new ethers.Interface(VESTING_FACTORY_ABI)
      // Encode the function call with parameters
      const encodedData = vestingFactoryInterface.encodeFunctionData(
        'createVestingContractWithSchedule',
        [
          components.tokenAddress,
          userWalletAddress,
          components.startTimestamp,
          components.periodDurationInSeconds,
          components.totalPeriods,
          components.totalAmount,
        ]
      )

      console.log(encodedData)

      const signedTransaction =
        await this.privy.walletApi.ethereum.sendTransaction({
          address: userWalletAddress,
          chainType: 'ethereum',
          caip2: `eip155:${ESupportedChains[components.chain]}`,
          transaction: {
            value: Number(0),
            chainId: +ESupportedChains[components.chain],
            to: ETokenFactoryDeployments[components.chain],
            data: encodedData,
          },
        })

      this.logger.log('Vesting creation transaction signed successfully')
      this.logger.log('Create vesting job finished, proceed action...')
      return { success: true }
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
