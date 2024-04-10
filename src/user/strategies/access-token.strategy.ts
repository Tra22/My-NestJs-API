import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Payload } from '../../global/config';
import { Repository } from 'typeorm';
import { User } from '../models';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AccessTokenStrategy extends PassportStrategy(
  Strategy,
  'access-jwt',
) {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    public readonly config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get('ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(payload: Payload) {
    return await  this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect("user.roles", "roles", "roles.isActive = true")
      .leftJoinAndSelect('roles.permissions', 'permissions', 'permissions.isActive = true')
      .where('user.id = :userId', { userId: payload?.sub }).getOne();
  }
}