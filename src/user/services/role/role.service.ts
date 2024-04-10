import {
    Injectable,
    NotFoundException,
  } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { Response } from 'src/global/payload/responses/Response';
import { Role } from 'src/user/models/role.model';
import { RoleDto } from 'src/user/dtos/responses/role/role.dto';
import { CreateRoleDto } from 'src/user/dtos/requests/role/create-role.dto';
import { UpdateRoleDto } from 'src/user/dtos/requests/role/update-role.dto';
import { IPaginationOptions, Pagination, paginate } from 'nestjs-typeorm-paginate';
@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private readonly roleRepo: Repository<Role>,
    @InjectMapper() 
    private readonly classMapper: Mapper,
  ) {}
  
  public async getAllRoles(): Promise<Response<RoleDto[]>> {
    return Response.data(await this.classMapper.mapArrayAsync(
      await this.roleRepo.createQueryBuilder('role')
          .leftJoinAndSelect('role.permissions', 'permissions', 'permissions.isActive = true')
          .getMany(), 
      Role, 
      RoleDto));
  }

  public async getAllRolesWithPagination(page: number, size: number) : Promise<Pagination<RoleDto>>{
    const permissionPagination = await paginate<Role>(this.roleRepo, {page: page, limit: size} as IPaginationOptions);
    return new Pagination<RoleDto>(
      await this.classMapper.mapArrayAsync(permissionPagination.items, Role, RoleDto),
      permissionPagination.meta,
      permissionPagination.links,
    );
  } 

  public async getRoleById(roleId: string): Promise<Response<RoleDto>>{
    const role = await this.roleRepo.createQueryBuilder('role')
        .leftJoinAndSelect('role.permissions', 'permissions', 'permissions.isActive = true')
        .where('role.id = :roleId', { roleId })
        .getOne();
    if(!role) throw new NotFoundException("Role not found!");
    return Response.data(this.classMapper.map(role, Role, RoleDto));
  }

  public async createRole(createRoleDto: CreateRoleDto) : Promise<Response<RoleDto>>{
    return Response.data(
      await this.classMapper.mapAsync(
        await this.roleRepo.save(
            this.classMapper.map(createRoleDto, CreateRoleDto, Role)
        ),
        Role, 
        RoleDto
      )
    );
  }

  public async updateRoleById(roleId: string, updateRoleDto: UpdateRoleDto) : Promise<Response<RoleDto>> {
    const role =  await this.roleRepo.createQueryBuilder('role')
    .leftJoinAndSelect('role.permissions', 'permissions', 'permissions.isActive = true')
    .where('role.id = :roleId', { roleId })
    .getOne();
    if(!role) throw new NotFoundException("Role not found!");
    const updateModel = this.classMapper.map(updateRoleDto, UpdateRoleDto, Role);
    return Response.data(await this.classMapper.mapAsync(
      await this.roleRepo.save({id: roleId, ...updateModel}),
      Role, 
      RoleDto
    ));
  }

  public async deleteRoleById(roleId: string): Promise<void>{
    const role = await this.roleRepo.findOne({where: {id: roleId}});
    if(!role) throw new NotFoundException("Role not found!");
    this.roleRepo.remove(role);
  }
}