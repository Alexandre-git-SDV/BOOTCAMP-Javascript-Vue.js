import { Router } from 'express';
import * as authCtrl from '../controllers/authController';

const router = Router();

router.post('/login', authCtrl.login);

router.post('/register', authCtrl.register);

// la route me est définie dans server.ts

router.post('/refresh', authCtrl.refresh);

export default router;
