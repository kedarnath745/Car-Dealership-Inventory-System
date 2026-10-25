import { Router } from 'express';
import { validateBody } from '../../middleware/validate';
import * as authController from './auth.controller';
import { loginSchema, registerSchema } from './auth.schemas';

export const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), authController.register);
authRouter.post('/login', validateBody(loginSchema), authController.login);
