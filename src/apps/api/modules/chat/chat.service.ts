import { Injectable } from '@nestjs/common';
import {drizzleProvider} from '../drizzle/drizzle.provider'
import { users } from '../drizzle/schema';

@Injectable()
export class ChatService {
    private db;
    constructor() {
        this.db = drizzleProvider
    }

    async createChat() {
        await this.db.select().from(users)
    }
}
