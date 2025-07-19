import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../users.entity';

export class UserResponseDto {
  @ApiProperty() id!: number;
  @ApiProperty() uuid!: string;
  @ApiProperty() role!: UserRole;
  @ApiProperty() email!: string;
  @ApiProperty() first_name!: string;
  @ApiProperty() last_name!: string;
  @ApiProperty() phone!: number;
  @ApiProperty() created_at!: Date;
  @ApiProperty() updated_at!: Date;
}