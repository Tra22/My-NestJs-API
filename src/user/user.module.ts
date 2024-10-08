import { Module } from '@nestjs/common';
import { UserController } from './controllers/user/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './models/refresh-token.model';
import { User } from './models/user.model';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserService } from './services/user/user.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategies';
import { UserProfile } from './mappers';
import { AuthenticationController } from './controllers/authentication/authentication.controller';
import { AuthenticationService } from './services/authentication/authentication.service';
import { Role } from './models/role.model';
import { Permission } from './models/permission.model';
import { RoleProfile } from './mappers/role/role.profile';
import { PermissionProfile } from './mappers/permission/permission.profile';
import { RoleService } from './services/role/role.service';
import { PermissionService } from './services/permission/permission.service';
import { RoleController } from './controllers/role/role.controller';
import { PermissionController } from './controllers/permission/permission.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, RefreshToken]),
    JwtModule.register({}),
    PassportModule.register({
      session: false,
    }),
  ],
  providers: [
    UserService,
    AuthenticationService,
    PermissionProfile,
    RoleProfile,
    UserProfile,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    RoleService,
    PermissionService,
  ],
  controllers: [
    UserController,
    AuthenticationController,
    RoleController,
    PermissionController,
  ],
})
export class UserModule {}
