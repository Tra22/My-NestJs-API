import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as argon from 'argon2';
import { RefreshToken, User } from '../../models';
import { RefreshtokenDto, RegisterDto, SigninDto } from '../../dtos/requests';
import { UserDto } from '../../dtos/responses';
import { JwtConfig, Payload, accessTokenConfig, refreshTokenConfig } from '../../../global/config';
import { UpdateProfileDto } from '../../dtos/requests/authentication/update-profile.dto';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepo: Repository<RefreshToken>,
        @InjectMapper() 
        private readonly classMapper: Mapper,
        private readonly jwtService: JwtService,
      ) {}
    
      public async register(dto: RegisterDto): Promise<UserDto> {
        try {
          const user = this.classMapper.map(dto, RegisterDto, User);
          const hash = await argon.hash(dto.password);
          return this.classMapper.mapAsync(await this.userRepo.save({...user, hash: hash}), User, UserDto);
        } catch (error) {
          if (error instanceof QueryFailedError) {
            throw new ForbiddenException(`Email ${dto.email} is already in use`);
          }
    
          throw error;
        }
      }
    
      public async signin(dto: SigninDto): Promise<{
        access_token: string;
        refresh_token: string;
      }> {
        const user = await this.userRepo.findOne({
          where: {
            email: dto.email,
          },
          select: {
            id: true,
            email: true,
            hash: true,
          },
        });
    
        if (!user) throw new NotFoundException('Invalid username and password');
    
        const passwordMatch = await argon.verify(user.hash, dto.password);
        if (!passwordMatch) throw new UnauthorizedException('Invalid username and password');
    
        const payload: Payload = {
          sub: user.id,
          email: user.email,
        };
    
        const accessToken = this.generateJWT(payload, accessTokenConfig());
        const refreshToken = this.generateJWT(payload, refreshTokenConfig());
    
        const doc = await this.refreshTokenRepo.findOne({ where: { user } });
    
        if (doc) {
          await this.refreshTokenRepo.update({ user }, { token: refreshToken });
    
          return {
            access_token: accessToken,
            refresh_token: refreshToken,
          };
        }
    
        await this.refreshTokenRepo.save({
          token: refreshToken,
          user,
        });
    
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
        };
      }
    
      public async refreshToken(
        user: UserDto,
        dto: RefreshtokenDto,
      ): Promise<{
        access_token: string;
      }> {
        const refreshToken = await this.refreshTokenRepo.findOne({
          where: { token: dto.refreshToken },
        });
    
        if (!refreshToken) throw new UnauthorizedException();
    
        const payload: Payload = {
          sub: user.id,
          email: user.email,
        };
    
        const accessToken = this.generateJWT(payload, accessTokenConfig());
    
        return {
          access_token: accessToken,
        };
      }
    
      public async updateUser(
        userId: string,
        dto: UpdateProfileDto,
      ): Promise<UserDto> {
        const userData = await this.userRepo.findOne({
          where: {
            id: userId,
          }
        })
        if(!userData) throw new NotFoundException('User not found!');
        if (dto.password) {
          const { password, ...rest } = dto;
          const hash = await argon.hash(password);
    
          return this.classMapper.mapAsync(await this.userRepo.save(
            {
              hash,
              id: userId,
              ...rest,
            },
          ), User, UserDto);
        }
    
        return this.classMapper.mapAsync(await this.userRepo.save(
          {
            id: userId,
            hash: userData.hash,
            ...dto,
          },
        ), User, UserDto);
      }
    
      public async signout(user: UserDto): Promise<void> {
        await this.refreshTokenRepo.delete({ user });
      }
    
      public generateJWT(payload: Payload, config: JwtConfig): string {
        return this.jwtService.sign(payload, {
          secret: config.secret,
          expiresIn: config.expiresIn,
        });
      }
}
