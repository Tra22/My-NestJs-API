import { AutoMap } from '@automapper/classes';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @AutoMap()
  @IsNotEmpty()
  name: string;

  @AutoMap()
  @IsString()
  @IsOptional()
  description?: string;

  @AutoMap()
  @IsOptional()
  permissions?: string[];
}
