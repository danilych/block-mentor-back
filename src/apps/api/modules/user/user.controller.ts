import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { UserService } from './user.service'
import {
  GetTokensByAddressDto,
  GetTokensByUserDto,
} from './dto/get-tokens-by-user.dto'
import { GetVestingsByUserDto } from './dto/get-vestings-by-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('tokens/:wallet')
  async getTokensByUser(@Param() params: GetTokensByUserDto) {
    try {
      return await this.userService.getTokensByUser(params.wallet)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching user tokens'
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND)
    }
  }

  @Get('token/:address')
  async getTokensByAddress(@Param() params: GetTokensByAddressDto) {
    try {
      return await this.userService.getTokenByAddress(params.address)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching user token'
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND)
    }
  }

  @Get('vestings/:wallet')
  async getVestingsByUser(@Param() params: GetVestingsByUserDto) {
    try {
      return await this.userService.getVestingsByUser(params.wallet)
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'An error occurred while fetching user vestings'
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND)
    }
  }
}
