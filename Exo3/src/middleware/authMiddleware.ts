import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Type pour les requêtes contenant un utilisateur authentifié
export interface AuthRequest extends Request {
  user?: {
    sub: string;
    email: string;
    role?: string;
  };
}

// Type du contenu du token JWT
interface JwtPayload {
  sub: string;
  email: string;
  role?: string;
  iat?: number;
  exp?: number;
}

function getToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return null;
  return header.split(' ')[1];
}

// fonction pour vérifier l’authentification
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const token = getToken(req);
  if (!token) return res.status(401).json({ message: 'Token manquant' });

  const secret = process.env.JWT_SECRET;
  if (!secret) return res.status(500).json({ message: 'Clé JWT manquante' });

  try {
    const decoded = jwt.verify(token, secret) as JwtPayload;
    req.user = {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };
    next();
  } catch (error) {
    console.error('Erreur JWT :', error);
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
}

// Fonction pour vérifier le rôle
export function requireRole(role: string) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Accès interdit' });
    }

    next();
  };
}

// Middleware pour obtenir l’utilisateur authentifié
export function getAuthUser(req: AuthRequest) {
  return req.user ?? null;
}
