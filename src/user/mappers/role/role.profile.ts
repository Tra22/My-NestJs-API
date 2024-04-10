import { Mapper, createMap, forMember, ignore, mapFrom } from "@automapper/core";
import { AutomapperProfile, InjectMapper } from "@automapper/nestjs";
import { Injectable } from "@nestjs/common";
import { RoleDto } from "../../dtos/responses/role/role.dto";
import { Role } from "../../models/role.model";
import { CreateRoleDto } from "../../dtos/requests/role/create-role.dto";
import { UpdateRoleDto } from "../../dtos/requests/role/update-role.dto";
import { Permission } from "../../models/permission.model";

@Injectable()
export class RoleProfile extends AutomapperProfile {
  constructor(@InjectMapper() mapper: Mapper) {
    super(mapper);
  }

  override get profile() {
    return (mapper) => {
      // model to dto
      createMap(mapper, Role, RoleDto);
      //dto to model
      createMap(mapper, CreateRoleDto, Role, 
        forMember((dest) => dest.id, ignore()),
        forMember(d => d.permissions, mapFrom(p => p.permissions.map(s => ({id: s} as Permission))))
      );
      createMap(mapper, UpdateRoleDto, Role, 
        forMember(d => d.permissions, mapFrom(p => p.permissions.map(s => ({id: s} as Permission)))),
        forMember((dest) => dest.updatedAt, mapFrom(p => new Date()))
      );
    };
  }
}