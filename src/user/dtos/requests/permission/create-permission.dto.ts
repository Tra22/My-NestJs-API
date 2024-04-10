import { AutoMap } from "@automapper/classes";
import { IsNotEmpty } from "class-validator";

export class CreatePermissionDto {
  @AutoMap()
  @IsNotEmpty()
  name: string;
  
  @AutoMap()
  @IsNotEmpty()
  description: string;

}