import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, MinLength } from 'class-validator';
import { UserRole } from 'src/modules/users/users.entity';

export class RegisterDto {
  @ApiProperty({ example: 'david' })
  @IsString()
  firstName!: string

  @ApiProperty({ example: 'heith' })
  @IsString()
  lastName!: string

  @ApiProperty({ example: '0123456789' })
  @IsString()
  phone!: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Strong@123' })
  @MinLength(8)
  password!: string;

  @ApiProperty({ enum: UserRole, enumName: 'UserRole', example: UserRole.VIEWER })
  @IsEnum(UserRole)
  role!: UserRole;
}

export class LoginDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Strong@123' })
  @MinLength(8)
  password!: string;
}