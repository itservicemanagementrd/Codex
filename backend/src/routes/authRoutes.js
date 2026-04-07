import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../models/db.js';
import { env } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

export const authRoutes = Router();

authRoutes.post('/login', async (req, res, next) => {
  const { email, password } = req.body;
  const user = db.users.find((u) => u.email === email);

  if (!user) {
    return next(new HttpError(401, 'Invalid credentials'));
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return next(new HttpError(401, 'Invalid credentials'));
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.tokenTtl });

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      orgId: user.orgId
    }
  });
});
