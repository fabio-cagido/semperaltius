import { User } from '@/types/auth';

export const SYSTEM_USERS: User[] = [
  {
    id: 'semperaltius',
    username: 'semperaltius',
    name: 'Direção Semper Altius',
    role: 'admin',
    allowedUnits: ['Todas', 'Curitiba', 'Rio de Janeiro'],
    defaultUnit: 'Todas',
    unitLabel: 'Rede Semper Altius (Geral)',
  },
  {
    id: 'curitiba',
    username: 'curitiba',
    name: 'Gestão Everest Curitiba',
    role: 'unit_curitiba',
    allowedUnits: ['Curitiba'],
    defaultUnit: 'Curitiba',
    unitLabel: 'Unidade Curitiba',
  },
  {
    id: 'rio',
    username: 'rio',
    name: 'Gestão Everest Rio de Janeiro',
    role: 'unit_rio',
    allowedUnits: ['Rio de Janeiro'],
    defaultUnit: 'Rio de Janeiro',
    unitLabel: 'Unidade Rio de Janeiro',
  },
];

// Senhas oficiais configuradas para cada perfil
export const PROFILE_PASSWORDS: Record<string, string[]> = {
  semperaltius: ['semperaltius2026', 'everest2026'],
  curitiba: ['curitiba2026', 'everest2026'],
  rio: ['rio2026', 'everest2026'],
};

export function authenticateProfile(
  userId: string,
  passwordInput: string
): { success: boolean; user?: User; error?: string } {
  const cleanPass = passwordInput.trim();
  const validPasswords = PROFILE_PASSWORDS[userId];

  if (!validPasswords) {
    return { success: false, error: 'Perfil não reconhecido.' };
  }

  if (validPasswords.includes(cleanPass)) {
    const user = SYSTEM_USERS.find((u) => u.id === userId);
    if (user) {
      return { success: true, user };
    }
  }

  return { success: false, error: 'Senha incorreta para este perfil. Tente novamente.' };
}

export function authenticateUser(usernameInput: string, passwordInput: string): User | null {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  for (const user of SYSTEM_USERS) {
    if (user.id === cleanUser || user.username === cleanUser) {
      const auth = authenticateProfile(user.id, cleanPass);
      if (auth.success && auth.user) return auth.user;
    }
  }
  return null;
}
