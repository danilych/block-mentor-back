import {
  CanActivate,
  ExecutionContext,
  GoneException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DrizzleAsyncProvider } from '../../drizzle/drizzle.provider';
import { AuthService } from '../auth.service';
import * as schema from "../../drizzle/schema";
import { eq } from 'drizzle-orm';

@Injectable()
export class PrivyGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    @Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const header = req.headers['authorization'];
    const authToken = header?.replace(/^Bearer /, '');

    if (!authToken) {
      throw new UnauthorizedException('Missing auth token.');
    }

    const params = await this.authService.authWithPrivy({authToken});

    if (!params || !params.defaultWalletAddress) {
      return false;
    }

    const userStillExists = await this.db.select().from(schema.users).where(eq(schema.users.wallet, params.defaultWalletAddress)).then(res => res[0])

    if (!userStillExists) {
      throw new GoneException();
    }

    Reflect.defineMetadata(
      'user',
      userStillExists,
      context.getHandler(),
    );

    return true;
  }
}
