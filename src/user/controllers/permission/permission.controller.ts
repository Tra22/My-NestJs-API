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
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionService } from '../../services/permission/permission.service';
import { PermissionGuard } from '../../securities/permissions.security';
import { Permissions } from '../../decorators';
import { PermissionDto } from '../../dtos/responses/permission/permission.dto';
import { Response } from '../../../global/payload/responses/Response';
import { CreatePermissionDto } from '../../dtos/requests/permission/create-permission.dto';
import { UpdatePermissionDto } from '../../dtos/requests/permission/update-permission.dto';
  
  @ApiBearerAuth()
  @ApiTags('permissions')
  @Controller('permissions')
  export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}
    
    @Permissions('permission::read')
    @UseGuards(PermissionGuard)
    @Get('page')
    @HttpCode(HttpStatus.OK)
    async getAllPermissionWithPagination(
      @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
      @Query('size', new DefaultValuePipe(10), ParseIntPipe) size: number = 10,
    ) : Promise<Response<Pagination<PermissionDto>>> {
      return Response.data(await this.permissionService.getAllPermissionsWithPagination(page, size));
    }

    @Permissions('permission::read')
    @UseGuards(PermissionGuard)
    @Get()
    @HttpCode(HttpStatus.OK)
    getAllPermissions(): Promise<Response<PermissionDto[]>> {
      return this.permissionService.getAllPermissions();
    }

    @Permissions('permission::read')
    @UseGuards(PermissionGuard)
    @Get(':id')
    @HttpCode(HttpStatus.OK)
    getPermissionById(@Param('id') id: string): Promise<Response<PermissionDto>> {
      return this.permissionService.getPermissionById(id);
    }

    @Permissions('permission::write')
    @UseGuards(PermissionGuard)
    @Post()
    createPermission(@Body() createPermissionDto: CreatePermissionDto) : Promise<Response<PermissionDto>> {
      return this.permissionService.createPermission(createPermissionDto);
    }

    @Permissions('permission::update')
    @UseGuards(PermissionGuard)
    @Patch(':id')
    updatePermission (@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) : Promise<Response<PermissionDto>> {
      return this.permissionService.updatePermissionById(id, updatePermissionDto);
    }

    @Permissions('permission::delete')
    @UseGuards(PermissionGuard)
    @HttpCode(HttpStatus.NO_CONTENT)
    @Delete(':id')
    async deletePermissionById(@Param('id') id: string): Promise<Response<string>> {
      await this.permissionService.deletePermissionById(id);
      return Response.ok();
    }
  }