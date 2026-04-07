import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { db } from '../models/db.js';
import { calculateScenario } from '../services/pricingService.js';
import { HttpError } from '../utils/httpError.js';

export const scenarioRoutes = Router();

scenarioRoutes.post('/generate', (req, res, next) => {
  try {
    const { projectId, mode, downPayment, frequency, installments, extraPayments } = req.body;
    const project = db.projects.find((p) => p.id === projectId && p.orgId === req.user.orgId);
    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    const scenario = calculateScenario({
      mode,
      project,
      downPayment,
      frequency,
      installments,
      extraPayments
    });

    db.analytics.push({
      id: uuid(),
      orgId: req.user.orgId,
      userId: req.user.id,
      projectId,
      mode,
      viewedAt: new Date().toISOString()
    });

    res.json(scenario);
  } catch (error) {
    next(error);
  }
});

scenarioRoutes.post('/save', (req, res, next) => {
  try {
    const { name, projectId, inputs, result } = req.body;
    const project = db.projects.find((p) => p.id === projectId && p.orgId === req.user.orgId);
    if (!project) {
      throw new HttpError(404, 'Project not found');
    }

    const scenario = {
      id: uuid(),
      orgId: req.user.orgId,
      userId: req.user.id,
      name: name || `${project.name} scenario`,
      projectId,
      inputs,
      result,
      createdAt: new Date().toISOString()
    };

    db.scenarios.push(scenario);
    res.status(201).json(scenario);
  } catch (error) {
    next(error);
  }
});

scenarioRoutes.get('/', (req, res) => {
  const scenarios = db.scenarios.filter((s) => s.orgId === req.user.orgId);
  res.json(scenarios);
});
