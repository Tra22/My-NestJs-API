import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsNumber,
} from 'class-validator';
import { CreateItemDto } from './create-items.dto';
import { Transform, Type } from 'class-transformer';

export class CreateReceiptDto {
  @IsString()
  @IsNotEmpty()
  shopName: string;

  @IsString()
  @IsNotEmpty()
  shopAddress: string;

  @IsString()
  @IsNotEmpty()
  shopPhone: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto) // Type ensures that each item is validated as CreateItemDto
  items: CreateItemDto[];

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  @Type(() => Number)
  total: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  cash: number;

  @IsNumber()
  @Transform(({ value }) => parseFloat(value))
  change: number;

  @IsOptional()
  @IsString()
  bankCardLast4Digits?: string;

  @IsOptional()
  @IsString()
  approvalCode?: string;

  @IsOptional()
  @IsString()
  message?: string;
}
