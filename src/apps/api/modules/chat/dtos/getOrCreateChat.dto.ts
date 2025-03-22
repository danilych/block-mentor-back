import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class GetOrCreateChatDto {
  @ApiProperty({
    description: 'Users id',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string
}
