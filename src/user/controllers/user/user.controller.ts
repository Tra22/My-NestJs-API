import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    HttpCode,
    HttpStatus,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Query,
    UseGuards,
  } from '@nestjs/common';
import { UserService } from '../../services/user/user.service';
import { UserDto } from '../../dtos/responses';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../../decorators';
import { PermissionGuard } from '../../securities/permissions.security';
import { Response } from '../../../global/payload/responses/Response';
import { CreateUserDto, UpdateUserDto } from '../../dtos/requests';
  
  @ApiBearerAuth()
  @ApiTags('users')
  @Controller('users')
  export class UserController {
    constructor(private readonly userService: UserService) {}

    @Permissions('user::read')
    @UseGuards(PermissionGuard)
    @Get('page')
    @HttpCode(HttpStatus.OK)
    async getAllRoleWithPagination(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number = 10,
    ) : Promise<Response<Pagination<UserDto>>> {
      return Response.data(await this.userService.getAllUsersWithPagination(page, size));
    }


    @Permissions('user::read')
    @UseGuards(PermissionGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    getAllUsers(): Promise<Response<UserDto[]>> {
      return this.userService.getAllUsers();
    }

    @Permissions('user::read')
    @UseGuards(PermissionGuard)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getUserById(@Param('id') id: string): Promise<Response<UserDto>> {
      return this.userService.getUserById(id);
    }

    @Permissions('user::write')
    @UseGuards(PermissionGuard)
    @Post()
    createUser(@Body() createUserDto: CreateUserDto) : Promise<Response<UserDto>> {
      return this.userService.createUser(createUserDto);
    }

    @Permissions('user::update')
    @UseGuards(PermissionGuard)
    @Patch(':id')
    updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) : Promise<Response<UserDto>> {
      return this.userService.updateUserById(id, updateUserDto);
    }

    @Permissions('user::delete')
    @UseGuards(PermissionGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deleteUserById(@Param('id') id: string): Promise<Response<string>> {
      await this.userService.deleteUserById(id);
      return Response.ok();
    }
  }