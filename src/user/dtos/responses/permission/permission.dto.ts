import { AutoMap } from "@automapper/classes";

export class PermissionDto {
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

}