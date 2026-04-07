import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { db } from '../models/db.js';
import { HttpError } from '../utils/httpError.js';

export function requireAuth(req, _res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Missing authentication token'));
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    const user = db.users.find((u) => u.id === payload.sub);
    if (!user) {
      return next(new HttpError(401, 'User not found'));
    }

    req.user = user;
    next();
  } catch {
    next(new HttpError(401, 'Invalid authentication token'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions'));
    }
    next();
  };
}
