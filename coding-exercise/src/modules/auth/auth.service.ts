import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import * as bcrypt from 'bcrypt';

import { RegisterDto, LoginDto } from './dto/auth.dto';

import { UserService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('This email ID already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(registerDto.password, salt);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });
    return { message: 'User successfully registered' };
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateToken(user);
  }

  logout() {
    // logout is need to be handle on the client by deleting the token
    return { message: 'Successfully logged out ' };
  }

  private generateToken(user: any) {
    const payload = {
      sub: user.id,
      uuid: user.uuid,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      email: user.email,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}