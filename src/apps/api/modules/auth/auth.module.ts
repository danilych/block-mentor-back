import { Module } from '@nestjs/common'
import { drizzleProvider } from '../drizzle/drizzle.provider'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...drizzleProvider],
  exports: [AuthService],
})
export class AuthModule {}
