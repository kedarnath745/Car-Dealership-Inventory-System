import type { Request, Response } from 'express';
import { currentUser } from '../../middleware/requireAuth';
import * as authService from './auth.service';

export async function register(req: Request, res: Response): Promise<void> {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response): Promise<void> {
  const result = await authService.login(req.body);
  res.status(200).json(result);
}

export function me(req: Request, res: Response): void {
  res.status(200).json({ user: currentUser(req) });
}
