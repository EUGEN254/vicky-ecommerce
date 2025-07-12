import express from 'express';
import { login, Logout } from '../Controllers/adminLoginController.js';

const router = express.Router();

router.post('/login', login);
router.post('/logout', Logout)

export default router;
