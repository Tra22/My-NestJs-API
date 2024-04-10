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
import { Response } from 'src/global/payload/responses/Response';
import { PermissionGuard } from 'src/user/securities/permissions.security';
import { Permissions } from 'src/user/decorators';
import { PermissionService } from 'src/user/services/permission/permission.service';
import { PermissionDto } from 'src/user/dtos/responses/permission/permission.dto';
import { UpdatePermissionDto } from 'src/user/dtos/requests/permission/update-permission.dto';
import { CreatePermissionDto } from 'src/user/dtos/requests/permission/create-permission.dto';
import { Pagination } from 'nestjs-typeorm-paginate';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  
  @ApiBearerAuth()
  @ApiTags('permissions')
  @Controller('permissions')
  export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}
    
    @Permissions('permission::read')
    @UseGuards(PermissionGuard)
    @Get()
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