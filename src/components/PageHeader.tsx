'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface PageHeaderProps {
  title: string;
  description?: string;
  count?: number;
  actions?: React.ReactNode;
}

export default function PageHeader({ title, description, count, actions }: PageHeaderProps) {
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // @ts-expect-error extra field
  const username: string = session?.user?.username ?? session?.user?.name ?? '';
  const desc = description ?? (count !== undefined ? `${count} ${count === 1 ? 'elemento' : 'elementos'}` : undefined);

  if (isMobile) {
    return (
      <div style={{ background: 'var(--app-surface)', borderBottom: '1px solid var(--app-border)' }}>
        {/* Fila 1: título + user pill + theme toggle */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: 8,
          padding: '12px 16px 8px',
        }}>
          <div style={{ minWidth: 0 }}>
            <h1 style={{
              fontSize: 19, fontWeight: 700, color: 'var(--app-text)',
              letterSpacing: '-0.4px', lineHeight: 1.2,
            }}>
              {title}
            </h1>
            {desc && (
              <p style={{ fontSize: 11.5, color: 'var(--app-text-subtle)', marginTop: 1 }}>{desc}</p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <ThemeToggle compact />
            {username && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 8px 4px 4px',
                borderRadius: 20,
                background: 'var(--app-surface-hover)',
                border: '1px solid var(--app-border)',
              }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'var(--app-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <User size={11} color="var(--app-accent-fg)" />
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)',
                  maxWidth: 52, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {username}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  title="Cerrar sesión"
                  style={{
                    padding: 0, border: 'none', background: 'none',
                    cursor: 'pointer', color: 'var(--app-text-subtle)', display: 'flex', lineHeight: 1,
                  }}
                >
                  <LogOut size={11} />
                </button>
              </div>
            )}
          </div>
        </div>

        {actions && (
          <div style={{ padding: '0 16px 10px' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              {actions}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px 24px 14px',
      borderBottom: '1px solid var(--app-border)',
      background: 'var(--app-surface)',
    }}>
      <div style={{
        display: 'flex', alignItems: 'flex-start',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: 'clamp(18px, 3vw, 24px)', fontWeight: 700,
            color: 'var(--app-text)', letterSpacing: '-0.5px',
            lineHeight: 1.23, marginBottom: desc ? 2 : 0,
          }}>
            {title}
          </h1>
          {desc && (
            <p style={{ fontSize: 13, color: 'var(--app-text-muted)', lineHeight: 1.5 }}>{desc}</p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0, flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
