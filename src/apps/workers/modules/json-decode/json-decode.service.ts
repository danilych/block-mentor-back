import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class JSONDecodeService {
  private readonly logger = new Logger(JSONDecodeService.name)

  constructor() {}

  async decode({
    name,
    ticker,
    initialAmount,
  }: {
    name: string
    ticker: string
    initialAmount: string
  }): Promise<any> {
    return
  }

  private async procceed() {
    return
  }
}
