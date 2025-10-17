import express from 'express';
import path from 'path';
import { existsSync } from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import { requireAuth } from './middleware/authMiddleware';
import userRepo from './repositories/userRepository';

// Chargement du fichier .env
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const publicDir = path.join(__dirname, '..', 'public');

// Middleware pour gérer les requêtes et erreurs
app.use((req, res, next) => {
  res.on('error', (err) => {
    console.error('Erreur de requête :', err);
    res.status(500).json({ message: 'Erreur serveur' });
  });
  next();
});

// Permet d'accepter des requêtes volumineuses 
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Petit logger pour voir les requêtes en console
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Lien avec touts les routes

app.use('/auth', authRouter);
app.use('/users', usersRouter);

// Page d’accueil / documentation API
app.get('/', (req, res) => {
  res.json({
    message: 'API connectée',
    endpoints: {
      register: 'POST /auth/register',
      login: 'POST /auth/login',
      me: 'GET /me',
      users: 'GET /users',
      userDetails: 'GET /users/:id',
      updateUser: 'PUT /users/:id',
      deleteUser: 'DELETE /users/:id',
    },
  });
});

// Fichiers statiques (après la route '/')
app.use(express.static(publicDir));

// Route me pour obtenir l'utilisateur connecté
app.get('/me', requireAuth as any, async (req: any, res) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Non authentifié' });
    }

    const user = await userRepo.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur introuvable' });
    }

    res.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Erreur utilisateur ou interne' });
  }
});

// Connexion à mongoDB
async function start() {
  const mongoUri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME;

  if (!mongoUri) {
    console.error('Erreur lien mongoDB dans le .env');
    process.exit(1);
  }

  console.log(`Connexion à MongoDB (base : ${dbName})...`);

  try {
    await mongoose.connect(mongoUri, { dbName });
    console.log('Connecté à MongoDB');

    // Lancement du serveur
    app.listen(PORT, () => {
      console.log(`Serveur mongoDB lancé sur http://localhost:${PORT}`);
      console.log('Base de données utilisée :', mongoose.connection.name);
    });
  } catch (error: any) {
    console.error('Erreur de connexion MongoDB :', error.message);
    process.exit(1);
  }
}

// Démarrage
start();
