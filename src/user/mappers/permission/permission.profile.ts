import {
  Mapper,
  createMap,
  forMember,
  ignore,
  mapFrom,
} from '@automapper/core';
import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { Permission } from '../../models/permission.model';
import { PermissionDto } from '../../dtos/responses/permission/permission.dto';
import { CreatePermissionDto } from '../../dtos/requests/permission/create-permission.dto';
import { UpdatePermissionDto } from '../../dtos/requests/permission/update-permission.dto';

@Injectable()
export class PermissionProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // model to dto
      createMap(mapper, Permission, PermissionDto);
      //dto to model
      createMap(
        mapper,
        CreatePermissionDto,
        Permission,
        forMember((dest) => dest.id, ignore()),
      );
      createMap(
        mapper,
        UpdatePermissionDto,
        Permission,
        forMember(
          (dest) => dest.updatedAt,
          mapFrom(() => new Date()),
        ),
      );
    };
  }
}
