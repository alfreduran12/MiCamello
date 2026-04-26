'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await signIn('credentials', {
      username: username.trim().toLowerCase(),
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/');
      router.refresh();
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f6f5f4',
      }}
    >
      <div
        className="notion-card"
        style={{ padding: '36px 32px', width: '100%', maxWidth: 380 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#0075de',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
              <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
              <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7" />
              <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7" />
              <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.4" />
            </svg>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: 'rgba(0,0,0,0.95)', letterSpacing: '-0.4px' }}>
            Mi Notion
          </span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'rgba(0,0,0,0.95)', marginBottom: 6, letterSpacing: '-0.3px' }}>
          Bienvenido de nuevo
        </h1>
        <p style={{ fontSize: 14, color: '#615d59', marginBottom: 24 }}>
          Ingresa tus credenciales para acceder
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: 6 }}>
              Usuario
            </label>
            <input
              className="notion-input"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="tu usuario"
              autoFocus
              autoComplete="username"
              required
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'rgba(0,0,0,0.7)', marginBottom: 6 }}>
              Contraseña
            </label>
            <input
              className="notion-input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div style={{
              padding: '8px 12px',
              background: '#fef2f2',
              border: '1px solid rgba(220,38,38,0.15)',
              borderRadius: 4,
              fontSize: 13,
              color: '#dc2626',
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
