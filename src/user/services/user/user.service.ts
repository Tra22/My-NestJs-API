import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../models';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserDto } from '../../dtos/responses';
import * as argon from 'argon2';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
import { Response } from '../../../global/payload/responses/Response';
import { CreateUserDto, UpdateUserDto } from '../../dtos/requests';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectMapper() 
    private readonly classMapper: Mapper,
  ) {}
  
  public async getAllUsers(): Promise<Response<UserDto[]>> {
    return Response.data(await this.classMapper.mapArrayAsync(
      await this.userRepo.createQueryBuilder('user')
          .leftJoinAndSelect("user.roles", "roles", "roles.isActive = true")
          .leftJoinAndSelect('roles.permissions', 'permissions', 'permissions.isActive = true').getMany(), 
      User, 
      UserDto));
  }

  public async getAllUsersWithPagination(page: number, size: number) : Promise<Pagination<UserDto>>{
    const permissionPagination = await paginate<User>(this.userRepo, {page: page, limit: size} as IPaginationOptions);
    return new Pagination<UserDto>(
      await this.classMapper.mapArrayAsync(permissionPagination.items, User, UserDto),
      permissionPagination.meta,
      permissionPagination.links,
    );
  } 

  public async getUserById(userId: string): Promise<Response<UserDto>>{
    const user = await this.userRepo.createQueryBuilder('user')
      .leftJoinAndSelect("user.roles", "roles", "roles.isActive = true")
      .leftJoinAndSelect('roles.permissions', 'permissions', 'permissions.isActive = true')
      .where('user.id = :userId', { userId })
      .getOne();
    if(!user) throw new NotFoundException("User not found!");
    return Response.data(this.classMapper.map(user, User, UserDto));
  }

  public async createUser(createUserDto: CreateUserDto) : Promise<Response<UserDto>>{
    return Response.data(
      await this.classMapper.mapAsync(
      await this.userRepo.save(
        this.classMapper.map(createUserDto, CreateUserDto, User)
      ),
      User, 
      UserDto
    ));
  }

  public async updateUserById(userId: string, updateUserDto: UpdateUserDto) : Promise<Response<UserDto>> {
    const user =  await this.userRepo.findOne({where: {id: userId}});
    if(!user) throw new NotFoundException("User not found!");
    const updateModel = this.classMapper.map(updateUserDto, UpdateUserDto, User);
    if(updateUserDto.password){
      const hash = await argon.hash(updateUserDto.password);
      return Response.data(await this.classMapper.mapAsync(await this.userRepo.save({id: userId, ...updateModel, hash: hash}), User, UserDto));
    }
    return Response.data(await this.classMapper.mapAsync(await this.userRepo.save({id: userId, ...updateModel}), User, UserDto));
  }

  public async deleteUserById(userId: string): Promise<void>{
    const user = await this.userRepo.findOne({where: {id: userId}});
    if(!user) throw new NotFoundException("User not found!");
    this.userRepo.remove(user);
  }
}