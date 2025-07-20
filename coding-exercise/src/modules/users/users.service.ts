import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ILike, Repository } from 'typeorm';

import { User } from './users.entity';
import { UpdateUserDto } from './dto/user-response-dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) { }

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findAll(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<{ data: User[]; total: number }> {
    let where: any = {};

    if (search) {
      const likeSearch = ILike(`%${search}%`);
      where = [
        { firstName: likeSearch },
        { lastName: likeSearch },
        { email: likeSearch },
      ];
    }
    const [data, total] = await this.userRepository.findAndCount({
      where: where.length ? where : undefined,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async updateUserDetail(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updateDto);
    return this.userRepository.save(user);
  }
}