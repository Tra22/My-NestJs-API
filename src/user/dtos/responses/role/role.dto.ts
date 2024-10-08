import { AutoMap } from '@automapper/classes';
import { PermissionDto } from '../permission/permission.dto';

export class RoleDto {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  description: string;
  @AutoMap()
  isActive: boolean;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;

  @AutoMap()
  permissions: PermissionDto;
}
