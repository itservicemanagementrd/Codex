'use client';

import { FormEvent, useState } from 'react';
import { apiRequest } from '@/lib/api';

interface Props {
  onLogin: (token: string, user: { name: string; role: string }) => void;
}

export function LoginForm({ onLogin }: Props) {
  const [email, setEmail] = useState('rep@prime.com');
  const [password, setPassword] = useState('Rep123!!');
  const [error, setError] = useState('');

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      const response = await apiRequest<{ token: string; user: { name: string; role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      onLogin(response.token, response.user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div className="card" style={{ maxWidth: 460, margin: '80px auto' }}>
      <h1>Real Estate Sales SaaS</h1>
      <p>Sign in to present pricing scenarios to clients.</p>
      <form onSubmit={handleSubmit} className="grid">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Login</button>
      </form>
      {error ? <p style={{ color: '#b91c1c' }}>{error}</p> : null}
    </div>
  );
}
