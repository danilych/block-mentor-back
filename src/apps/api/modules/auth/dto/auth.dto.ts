import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class AuthDTO {
  @ApiProperty()
  @IsNotEmpty()
  authToken: string;
}

export class RefreshTokensDTO {
  @ApiProperty()
  @IsNotEmpty()
  refreshToken: string;
}
