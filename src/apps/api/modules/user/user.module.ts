import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { drizzleProvider } from '../drizzle/drizzle.provider';

@Module({
  providers: [...drizzleProvider, UserService],
  controllers: [UserController]
})
export class UserModule {}
