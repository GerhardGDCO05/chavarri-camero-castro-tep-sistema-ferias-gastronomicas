import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user';
import { USER_ROLE } from 'src/users/user-role.enum';
@Injectable()
export class UserDatabase {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}
  async findUser(email?: string, id?: string) {
    if ((!email && !id) || (email && id)) return null;
    if (email) return await this.userRepo.findOne({ where: { email } });
    if (id) return await this.userRepo.findOne({ where: { id } });
  }
  async addUser(
    email: string,
    passwordHash: string,
    role: USER_ROLE,
    fullName: string,
  ) {
    const user = this.userRepo.create({
      email: email,
      passwordHash: passwordHash,
      role: role,
      fullName: fullName,
    });
    return this.userRepo.save(user);
  }
  async updateUser(
    id: string,
    {
      email,
      role,
      fullName,
      passwordHash,
    }: {
      email?: string;
      role?: USER_ROLE;
      fullName?: string;
      passwordHash?: string;
    },
  ) {
    const user = await this.findUser(id);
    if (!user) {
      throw new Error('User not found');
    }
    if (email) user.email = email;
    if (role) user.role = role;
    if (fullName) user.fullName = fullName;
    if (passwordHash) user.passwordHash = passwordHash;
    const updated = await this.userRepo.save(user);
    return updated;
  }
  async deleteUser(id: string) {
    const user = await this.findUser(id);
    if (!user) throw new Error('User not found');
    return this.userRepo.remove(user);
  }
}
