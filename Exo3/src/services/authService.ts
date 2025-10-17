import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import userRepo, { UserRepository } from '../repositories/userRepository';

export interface AuthResult {
  token: string;
  expiresIn: number; // en secondes
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role?: string; // Si besoin pour après
  };
}

// Création des constantes de temps pour les jwt
const DEFAULT_EXP = '1h';
const REFRESH_EXP_SECONDS = 60 * 60 * 24 * 7; // 7 jours
const refreshStore = new Map<string, { userId: string; exp: number }>();

// Génère un refresh token et l'enregistre en mémoire
function generateRefreshToken(userId: string): string {
  const token = Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
  const exp = Date.now() + REFRESH_EXP_SECONDS * 1000;

  refreshStore.set(token, { userId, exp });
  return token;
}

export function rotateRefreshToken(oldToken: string): string | null {
  const record = refreshStore.get(oldToken);
  if (!record) return null;

  // Si le refresh token a expiré
  if (record.exp < Date.now()) {
    refreshStore.delete(oldToken);
    return null;
  }

  // On le supprime et on en crée un nouveau
  refreshStore.delete(oldToken);
  return generateRefreshToken(record.userId);
}

// nouveau token si valide
export function validateNewToken(token: string): string | null {
  const record = refreshStore.get(token);
  if (!record) return null;

  // Suppression si expiré
  if (record.exp < Date.now()) {
    refreshStore.delete(token);
    return null;
  }

  return record.userId;
}

// Service d'authentification
export class AuthService {
  constructor(private repo: UserRepository = userRepo) {}

  // login 
  async login(email: string, password: string): Promise<AuthResult | null> {
    const user = await this.repo.findByEmail(email.toLowerCase());
    if (!user) return null;

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) return null;

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET manquant');

  const expSetting = process.env.JWT_EXP || DEFAULT_EXP;
    const userId = (user as any)._id.toString();

    const payload = {
      sub: userId,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, secret as jwt.Secret, { expiresIn: expSetting as any });
    const expStr = String(expSetting);
    const expiresIn = expStr.endsWith('h') // expire en heures
      ? parseInt(expStr) * 3600
      : 3600; // par défaut 1h

    const refreshToken = generateRefreshToken(userId);

    return {
      token,
      expiresIn,
      refreshToken,
      user: {
        id: userId,
        email: user.email,
        role: user.role,
      },
    };
  }
}

export default new AuthService();
