import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware';
import * as usersCtrl from '../controllers/usersController';

const router = Router();

router.get('/', requireAuth, usersCtrl.list as any);

router.get('/:id', requireAuth, usersCtrl.detail as any);

router.put('/:id', requireAuth, usersCtrl.update as any);

router.delete('/:id', requireAuth, usersCtrl.remove as any);

export default router;
