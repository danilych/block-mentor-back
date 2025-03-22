import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrivyClient } from '@privy-io/server-auth';
import { eq } from 'drizzle-orm';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { IAppConfig } from 'src/common/config/appConfig';
import { configNames } from 'src/common/constants/configNames';
import { DrizzleAsyncProvider } from '../drizzle/drizzle.provider';
import * as schema from "../drizzle/schema";

@Injectable()
export class AuthService {
    private client: PrivyClient;
    private readonly appConfig: IAppConfig;
    constructor(@Inject(DrizzleAsyncProvider) private db: NodePgDatabase<typeof schema>, private readonly configService: ConfigService) {
        this.appConfig = configService.getOrThrow<IAppConfig>(
            configNames.APP,
          );
      
          this.client = new PrivyClient(
            this.appConfig.privyId,
            this.appConfig.privySecret,
          );
    }

    async authWithPrivy(command: {authToken: string}) {
        const { authToken } = command;
        try {
            const verifiedClaims = await this.client.verifyAuthToken(authToken);
      
            const user = await this.client.getUser(verifiedClaims.userId);
      
            const defaultWallet = user.linkedAccounts.find(
              (account) =>
                account.type === 'wallet' &&
                account.connectorType === "embedded",
            );
      
            return {
              email: user.email?.address || undefined,
              defaultWalletAddress: defaultWallet
                ? defaultWallet['address']
                : undefined,
            };
          } catch (error) {
            throw new UnauthorizedException(
              'Invalid auth token.',
              error.message,
            );
          }
    }

    async auth(embededWallet: string, email?: string) {
        const user = await this.db.select().from(schema.users).where(eq(schema.users.wallet, embededWallet)).then(res => res[0] || null);;

        if (!user) {
            return await this.db.insert(schema.users).values({
                email: email ?? null,
                wallet: embededWallet
            }).returning()
        }

        return {
          user,
        };
    }
}
