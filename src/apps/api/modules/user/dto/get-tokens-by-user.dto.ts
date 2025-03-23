import { IsEthereumAddress, IsNotEmpty, IsString } from 'class-validator'

export class GetTokensByUserDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  wallet: string
}

export class GetTokensByAddressDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  @IsString()
  address: string
}
