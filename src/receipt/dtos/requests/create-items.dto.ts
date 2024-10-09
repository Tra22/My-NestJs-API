import { Transform } from 'class-transformer';
import { IsString, IsNumber } from 'class-validator';

export class CreateItemDto {
  @IsString()
  description: string;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  price: number;
}
