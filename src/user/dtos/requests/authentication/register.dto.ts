import { AutoMap } from '@automapper/classes';
import {
    IsEmail,
    IsNotEmpty,
    IsString,
    IsStrongPassword,
  } from 'class-validator';
import { Match } from 'src/global/decorator/password/match.decorator';
import { Unique } from 'src/user/decorators/unique.validation.decorator';
import { User } from 'src/user/models';
  
  export class RegisterDto {
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    firstName: string;
  
    @AutoMap()
    @IsString()
    @IsNotEmpty()
    lastName: string;
  
    @AutoMap()
    @IsEmail()
    @IsNotEmpty()
    @Unique(User)
    email: string;
  
    @IsString()
    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    @IsNotEmpty()
    password: string;
    @IsString()
    @IsStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    @IsNotEmpty()
    @Match('password')
    confirmPassword: string;
  }