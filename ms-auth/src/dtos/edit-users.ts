import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';
import { USER_ROLE } from '../users/user-role.enum';

export class EditUserDto {
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() @MinLength(6) password?: string;
  @IsOptional() @IsEnum(USER_ROLE) role?: USER_ROLE;
  @IsOptional() @IsString() fullName?: string;
}
