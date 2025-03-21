import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { GetTokensByUserDto } from "./dto/get-tokens-by-user.dto";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("tokens/:wallet")
  async getTokensByUser(@Param() params: GetTokensByUserDto) {
    try {
      return await this.userService.getTokensByUser(params.wallet);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An error occurred while fetching user tokens";
      throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
    }
  }
}
