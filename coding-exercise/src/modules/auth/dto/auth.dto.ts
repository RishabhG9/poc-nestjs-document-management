import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/users/users.entity';

export class RegisterDto {
  @IsString()
  firstName!: string

  @IsString()
  lastName!: string

  @IsNumber()
  phone!: number

  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;

  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  password!: string;
}