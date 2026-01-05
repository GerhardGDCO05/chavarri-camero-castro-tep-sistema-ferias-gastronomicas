import { Injectable } from '@nestjs/common';
import { UserDatabase } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user';
import { USER_ROLE } from 'src/users/user-role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly userDb: UserDatabase) {}
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userDb.findUser(email);
    if (user && (await bcrypt.compare(password, user.passwordHash))) {
      return user;
    }
    return null;
  }
  async addUser(
    email: string,
    password: string,
    role: USER_ROLE,
    fullName: string,
  ) {
    if (await this.userDb.findUser(email)) throw new Error('User exist');

    const hash = await bcrypt.hash(password, 10);
    return this.userDb.addUser(email, hash, role, fullName);
  }
  async editUser(
    id: string,
    email?: string,
    password?: string,
    role?: USER_ROLE,
    fullName?: string,
  ) {
    let hash = password;
    if (password) hash = await bcrypt.hash(password, 10);

    let user: User | undefined;
    try {
      user = await this.userDb.updateUser(id, {
        email,
        role,
        fullName,
        passwordHash: hash,
      });
    } catch (err) {
      return [];
    }
    return user;
  }
  async deleteUser(id: string) {
    let u: User | undefined;
    try {
      u = await this.userDb.deleteUser(id);
    } catch (err) {
      return [];
    }
    return u;
  }
  async getUser(id: string) {
    return this.userDb.findUser(undefined, id);
  }
}
