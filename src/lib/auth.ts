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

// Valid credentials map (supports common variants)
interface CredentialDef {
  userId: string;
  validUsernames: string[];
  validPasswords: string[];
}

const CREDENTIAL_DEFS: CredentialDef[] = [
  {
    userId: 'semperaltius',
    validUsernames: ['semperaltius', 'admin', 'direcao'],
    validPasswords: ['semperaltius2026', 'everest2026', 'semperaltius'],
  },
  {
    userId: 'curitiba',
    validUsernames: ['curitiba', 'everestcuritiba', 'ctba'],
    validPasswords: ['curitiba2026', 'everest2026', 'curitiba'],
  },
  {
    userId: 'rio',
    validUsernames: ['rio', 'riodejaneiro', 'everestrio', 'rj'],
    validPasswords: ['rio2026', 'riodejaneiro2026', 'everest2026', 'rio'],
  },
];

export function authenticateUser(usernameInput: string, passwordInput: string): User | null {
  const cleanUser = usernameInput.trim().toLowerCase();
  const cleanPass = passwordInput.trim();

  for (const cred of CREDENTIAL_DEFS) {
    if (cred.validUsernames.includes(cleanUser) && cred.validPasswords.includes(cleanPass)) {
      const foundUser = SYSTEM_USERS.find(u => u.id === cred.userId);
      return foundUser || null;
    }
  }

  return null;
}
