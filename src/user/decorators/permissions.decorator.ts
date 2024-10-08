import { SetMetadata, applyDecorators } from '@nestjs/common';

export const Permissions = (...args: string[]) =>
  applyDecorators(
    SetMetadata(
      'roles',
      args?.filter((s) => s?.toLowerCase()?.includes('role_')),
    ),
    SetMetadata(
      'permissions',
      args?.filter((s) => !s?.includes('role_')),
    ),
  );
