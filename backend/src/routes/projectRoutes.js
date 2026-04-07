import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../models/db.js';
import { requireRole } from '../middleware/auth.js';
import { HttpError } from '../utils/httpError.js';

export const projectRoutes = Router();

projectRoutes.get('/', (req, res) => {
  const projects = db.projects.filter((p) => p.orgId === req.user.orgId);
  res.json(projects);
});

projectRoutes.post('/', requireRole('admin'), (req, res, next) => {
  const { name, location, description, basePrice, currency, frequencies, paymentTerms } = req.body;
  if (!name || !basePrice || !paymentTerms) {
    return next(new HttpError(400, 'name, basePrice and paymentTerms are required'));
  }

  const project = {
    id: uuid(),
    orgId: req.user.orgId,
    name,
    location,
    description,
    basePrice: Number(basePrice),
    currency: currency || 'USD',
    frequencies: frequencies || ['monthly'],
    paymentTerms,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.projects.push(project);
  res.status(201).json(project);
});
