import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authService, { validateNewToken, rotateRefreshToken } from '../services/authService';
import userRepo from '../repositories/userRepository';

// Fonction pour renvoyer un utilisateur sans infos sensibles
const cleanUser = (user: any) => ({
  id: user._id?.toString() ?? user.id,
  email: user.email,
  role: user.role,
  name: user.name ?? null,
});

// Fonction d’erreur serveur
const sendServerError = (res: Response) => {
  return res.status(500).json({ message: 'Erreur serveur' });
};

// Controller pour l’inscription
export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const existingUser = await userRepo.findByEmail(email.toLowerCase());
    if (existingUser) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userRepo.create(email.toLowerCase(), hashedPassword, 'user');

    if (name) {
      newUser.name = name;
      await newUser.save();
    }

    return res.status(201).json({ user: cleanUser(newUser) });
  } catch (error) {
    console.error('Erreur register :', error);
    return sendServerError(res);
  }
};

// Controller pour la connexion
export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email et mot de passe requis' });
  }

  try {
    const tokens = await authService.login(email, password);
    if (!tokens) {
      return res.status(401).json({ message: 'Identifiants incorrects' });
    }

    return res.json(tokens);
  } catch (error) {
    console.error('Erreur login :', error);
    return sendServerError(res);
  }
};

// Route pour renouveller les tokens
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token requis' });
  }

  const userId = validateNewToken(refreshToken);
  if (!userId) {
    return res.status(401).json({ message: 'Refresh token invalide' });
  }

  const newRefreshToken = rotateRefreshToken(refreshToken);
  if (!newRefreshToken) {
    return res.status(401).json({ message: 'Refresh token expiré' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return sendServerError(res);

  const newToken = jwt.sign(
    { sub: userId },
    secret as jwt.Secret,
    { expiresIn: (process.env.JWT_EXP || '1h') as any }
  );

  return res.json({
    token: newToken,
    refreshToken: newRefreshToken,
  });
};

// Controller pour l'utilisateur connecté
export const me = async (req: any, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({ user: cleanUser(user) });
  } catch (error) {
    console.error('Erreur me :', error);
    return sendServerError(res);
  }
};

export default { register, login, refresh, me };
