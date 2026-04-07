'use client';

import { useState } from 'react';
import { LoginForm } from '@/components/LoginForm';
import { Dashboard } from '@/components/Dashboard';

export default function HomePage() {
  const [session, setSession] = useState<{ token: string; user: { name: string; role: string } } | null>(null);

  if (!session) {
    return <LoginForm onLogin={(token, user) => setSession({ token, user })} />;
  }

  return <Dashboard token={session.token} user={session.user} />;
}
