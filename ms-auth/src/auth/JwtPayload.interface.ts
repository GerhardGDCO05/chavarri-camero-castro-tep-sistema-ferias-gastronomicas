import { USER_ROLE } from 'src/users/user-role.enum';

export interface JwtPayload {
  sub: string;
  role: USER_ROLE;
  iat?: number;
  exp?: number;
}
