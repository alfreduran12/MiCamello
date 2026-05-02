'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const isDark = resolvedTheme === 'dark';

  if (compact) {
    return (
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        title={isDark ? 'Modo claro' : 'Modo oscuro'}
        style={{
          width: 28, height: 28,
          border: '1px solid var(--app-border)',
          borderRadius: 6,
          background: 'var(--app-surface-hover)',
          color: 'var(--app-text-muted)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          transition: 'background 0.15s, color 0.15s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--app-border)';
          (e.currentTarget as HTMLElement).style.color = 'var(--app-text)';
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)';
          (e.currentTarget as HTMLElement).style.color = 'var(--app-text-muted)';
        }}
      >
        {isDark ? <Sun size={13} /> : <Moon size={13} />}
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Modo claro' : 'Modo oscuro'}
      style={{
        display: 'flex', alignItems: 'center', gap: 7,
        padding: '6px 10px',
        border: 'none', borderRadius: 6,
        background: 'transparent',
        color: 'var(--app-text-muted)',
        fontSize: 13, fontWeight: 500,
        cursor: 'pointer', width: '100%',
        transition: 'background 0.1s, color 0.1s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)';
        (e.currentTarget as HTMLElement).style.color = 'var(--app-text)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
        (e.currentTarget as HTMLElement).style.color = 'var(--app-text-muted)';
      }}
    >
      {isDark ? <Sun size={14} /> : <Moon size={14} />}
      {isDark ? 'Modo claro' : 'Modo oscuro'}
    </button>
  );
}
