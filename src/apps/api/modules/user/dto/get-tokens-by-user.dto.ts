import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator'

export class GetTokensByUserDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  wallet: string
}

export class GetVestingsByUserDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  wallet: string
}
