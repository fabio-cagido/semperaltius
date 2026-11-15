import { UnidadeScope } from './dashboard';

export type UserRole = 'admin' | 'unit_curitiba' | 'unit_rio';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  allowedUnits: UnidadeScope[];
  defaultUnit: UnidadeScope;
  unitLabel: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAuthenticated: boolean;
}
