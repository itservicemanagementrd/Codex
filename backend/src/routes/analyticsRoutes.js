import { Router } from 'express';
import { db } from '../models/db.js';

export const analyticsRoutes = Router();

analyticsRoutes.get('/modes', (req, res) => {
  const entries = db.analytics.filter((row) => row.orgId === req.user.orgId);
  const modeUsage = entries.reduce((acc, item) => {
    acc[item.mode] = (acc[item.mode] || 0) + 1;
    return acc;
  }, {});

  res.json({
    totalViews: entries.length,
    modeUsage
  });
});
