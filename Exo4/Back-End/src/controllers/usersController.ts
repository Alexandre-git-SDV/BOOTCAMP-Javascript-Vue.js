import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userRepo from '../repositories/userRepository';

// Nettoyer les infos utilisateur avant de les renvoyer
const cleanUser = (user: any) => ({
  id: user._id?.toString() ?? user.id,
  email: user.email,
  role: user.role,
  name: user.name ?? null,
});

// Réponse d’erreur serveur
const sendServerError = (res: Response) => {
  return res.status(500).json({ message: 'Erreur serveur' });
};

// Controller pour lister les users
export const list = async (_req: Request, res: Response) => {
  try {
    const users = await userRepo.listAll();
    return res.json({ users: users.map(cleanUser) });
  } catch (error) {
    console.error('Erreur list users :', error);
    return sendServerError(res);
  }
};

// Controller pour les détails d’un user
export const detail = async (req: Request, res: Response) => {
  try {
    const user = await userRepo.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({ user: cleanUser(user) });
  } catch (error) {
    console.error('Erreur detail user :', error);
    return sendServerError(res);
  }
};

// Controller pour mettre à jour un user
export const update = async (req: Request, res: Response) => {
  try {
    const { email, role, name, password } = req.body;
    const updates: any = {};

    if (email) updates.email = email.toLowerCase();
    if (role) updates.role = role;
    if (name !== undefined) updates.name = name;
    if (password) updates.passwordHash = await bcrypt.hash(password, 10);

    const updatedUser = await userRepo.updateById(req.params.id, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({ user: cleanUser(updatedUser) });
  } catch (error: any) {
    if (error?.code === 11000) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    console.error('Erreur update user :', error);
    return sendServerError(res);
  }
};

// Controller pour supprimer un user
export const remove = async (req: Request, res: Response) => {
  try {
    const deletedUser = await userRepo.deleteById(req.params.id);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('Erreur delete user :', error);
    return sendServerError(res);
  }
};

export default { list, detail, update, remove };
