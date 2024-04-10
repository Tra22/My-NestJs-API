import {
    IsEmail,
    IsOptional,
    IsString,
    IsStrongPassword,
    Matches,
  } from 'class-validator';
import { Match } from '../../../../global/decorator/password/match.decorator';
  
  export class UpdateProfileDto {
    @IsString()
    @IsOptional()
    firstName?: string;
  
    @IsString()
    @IsOptional()
    lastName?: string;
  
    @IsEmail()
    @IsOptional()
    email?: string;
  
    @IsString()
    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    @IsOptional()
    password?: string;
    @Match('password')
    confirmPassword?: string;
  }