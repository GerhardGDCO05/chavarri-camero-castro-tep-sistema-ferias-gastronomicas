import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateStallDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}