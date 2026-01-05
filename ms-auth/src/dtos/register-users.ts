import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { USER_ROLE } from '../users/user-role.enum';
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(6) password: string;
  @IsEnum(USER_ROLE) role: USER_ROLE;
  @IsString() fullName: string;
}
