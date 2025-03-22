import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const PrivyAuth = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.privyAuthParams;
  },
);
