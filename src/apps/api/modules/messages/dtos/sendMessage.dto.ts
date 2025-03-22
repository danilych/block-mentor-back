import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class SendMessageDto {
  @ApiProperty({
    description: 'Prompt',
  })
  @IsString()
  @IsNotEmpty()
  prompt: string

  @ApiProperty()
  @IsNotEmpty()
  role: 'USER' | 'AGENT'
}
