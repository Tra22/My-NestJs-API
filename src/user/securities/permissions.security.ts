import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../models';
import { Repository } from 'typeorm';
  
  @Injectable()
  export class PermissionGuard implements CanActivate {
    constructor(
      private reflector: Reflector,
      private jwtService: JwtService,
      private config: ConfigService,
      @InjectRepository(User)
      private readonly userRepo: Repository<User>
    ) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest();
      const token = this.extractTokenFromHeader(request);
      if (!token) {
        throw new UnauthorizedException();
      }
      try {
        const payload = await this.jwtService.verifyAsync(
          token,
          {
            secret: this.config.get('ACCESS_TOKEN_SECRET'),
          }
        );
        const user = await this.userRepo.createQueryBuilder('user')
          .leftJoinAndSelect("user.roles", "roles", "roles.isActive = true")
          .leftJoinAndSelect('roles.permissions', 'permissions', 'permissions.isActive = true')
          .where('user.id = :userId', { userId: payload?.sub }).getOne();
        const roles = this.reflector.get<string[]>('roles', context.getHandler()) || [];
        const permissions = this.reflector.get<string[]>('permissions', context.getHandler()) || [];
        // 💡 We're assigning the payload to the request object here
        // so that we can access it in our route handlers
        const test = user?.roles?.filter(s => roles.includes(`role_${s.name}`) || s.permissions?.filter(i => permissions.includes(i.name))?.length > 0);
        if(test.length === 0) {
          throw new ForbiddenException();
        }
        request['user'] = {...payload, roles: roles, permissions: permissions};
      } catch(exception) {
        if(exception instanceof ForbiddenException) throw new ForbiddenException(exception);
        throw new UnauthorizedException();
      }
     
      return true;
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const [type, token] = request.headers.authorization?.split(' ') ?? [];
      return type === 'Bearer' ? token : undefined;
    }
  }