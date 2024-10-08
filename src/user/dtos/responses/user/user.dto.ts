import { AutoMap } from '@automapper/classes';
import { RoleDto } from '../role/role.dto';

export class UserDto {
  @AutoMap()
  id: string;

  @AutoMap()
  firstName: string;

  @AutoMap()
  lastName: string;

  @AutoMap()
  email: string;

  @AutoMap()
  isActive: boolean;

  @AutoMap()
  createdAt: Date;

  @AutoMap()
  updatedAt: Date;

  @AutoMap()
  roles: RoleDto;
}
