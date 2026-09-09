export type UserRole = 'member' | 'staff' | 'admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}


declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}