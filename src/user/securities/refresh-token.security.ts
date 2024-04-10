import { AuthGuard } from '@nestjs/passport';

export class RefreshTokenSecurity extends AuthGuard('refresh-jwt') {
  constructor() {
    super();
  }
}