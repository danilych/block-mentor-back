import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { TUser } from 'src/common/constants/types';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TUser => {
    return Reflect.getMetadata(
      'user',
      ctx.getHandler(),
    ) as TUser;
  },
);
