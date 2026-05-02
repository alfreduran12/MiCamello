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
        background: 'var(--app-bg)',
      }}
    >
      <div
        className="notion-card"
        style={{ padding: '36px 32px', width: '100%', maxWidth: 380 }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
          <picture style={{ display: 'flex', alignItems: 'center' }}>
            <source srcSet="/logoblanco.png" media="(prefers-color-scheme: dark)" />
            <img src="/logonegro.png" alt="Logo" style={{ height: 40, width: 'auto', objectFit: 'contain' }} />
          </picture>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-text)', marginBottom: 6, letterSpacing: '-0.3px' }}>
          Bienvenido de nuevo
        </h1>
        <p style={{ fontSize: 14, color: 'var(--app-text-muted)', marginBottom: 24 }}>
          Ingresa tus credenciales para acceder
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 6 }}>
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
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 6 }}>
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
              background: 'rgba(220,38,38,0.08)',
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
