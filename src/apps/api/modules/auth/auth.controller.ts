import { Controller, Post, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GetAuthorizationHeader } from './decorators/get-authorization-header.decorator';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) {}

  @Post()
  @ApiBearerAuth()
  async authWithPrivyAuth(
    @GetAuthorizationHeader() authToken: string | undefined,
  ): Promise<any> {
    if (!authToken) {
      throw new UnauthorizedException('Missing auth token.');
    }

    const privyAuthResult = await this.authService.authWithPrivy({authToken});

    const authResult = await this.authService.auth(privyAuthResult.defaultWalletAddress, privyAuthResult.email);

    return authResult;
  }
}
