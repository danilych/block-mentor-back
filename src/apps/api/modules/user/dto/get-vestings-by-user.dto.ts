import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator'

export class GetVestingsByUserDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  wallet: string
}
