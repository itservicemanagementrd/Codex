import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const now = () => new Date().toISOString();

const adminId = uuid();
const repId = uuid();

export const db = {
  organizations: [{ id: 'org-1', name: 'Prime Realty Group', createdAt: now() }],
  users: [
    {
      id: adminId,
      orgId: 'org-1',
      name: 'Admin User',
      email: 'admin@prime.com',
      role: 'admin',
      passwordHash: bcrypt.hashSync('Admin123!', 10),
      createdAt: now()
    },
    {
      id: repId,
      orgId: 'org-1',
      name: 'Sales Rep',
      email: 'rep@prime.com',
      role: 'rep',
      passwordHash: bcrypt.hashSync('Rep123!!', 10),
      createdAt: now()
    }
  ],
  projects: [
    {
      id: uuid(),
      orgId: 'org-1',
      name: 'Skyline Towers',
      location: 'Miami, FL',
      description: 'Modern residential development with premium amenities.',
      basePrice: 285000,
      currency: 'USD',
      frequencies: ['monthly', 'biweekly'],
      paymentTerms: {
        monthly: { maxInstallments: 120, annualRate: 0.085 },
        biweekly: { maxInstallments: 240, annualRate: 0.082 }
      },
      createdAt: now(),
      updatedAt: now()
    }
  ],
  scenarios: [],
  analytics: []
};
