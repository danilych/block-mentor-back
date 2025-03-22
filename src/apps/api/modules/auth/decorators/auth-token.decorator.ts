import { applyDecorators } from '@nestjs/common'
import { ApiHeaders } from '@nestjs/swagger'

export enum PrivyEnum {
  AUTH_TOKEN = 'auth_token',
}
export function PrivyTokenParams() {
  return applyDecorators(
    ApiHeaders([
      {
        name: PrivyEnum.AUTH_TOKEN,
        required: true,
      },
    ])
  )
}
