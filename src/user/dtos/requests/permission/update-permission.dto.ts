import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";

export class UpdatePermissionDto {
  @AutoMap()
  @IsNotEmpty()
  name: string;
  
  @AutoMap()
  @IsNotEmpty()
  description: string;

}