import { AuthGuard } from '@nestjs/passport';

export class AccessTokenSecurity extends AuthGuard('access-jwt') {
  constructor() {
    super();
  }
}