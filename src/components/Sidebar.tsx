'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard, FolderKanban, GitBranch, CheckSquare,
  Activity, FileText, Users, UserCog, LogOut,
  ChevronLeft, ChevronRight, User, Plus, NotebookPen,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export const NAV_ITEMS = [
  { id: 'dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { id: 'notas',        label: 'Notas',         icon: NotebookPen },
  { id: 'proyectos',    label: 'Proyectos',     icon: FolderKanban },
  { id: 'repos',        label: 'Repos',         icon: GitBranch },
  { id: 'tareas',       label: 'Tareas',        icon: CheckSquare },
  { id: 'actividades',  label: 'Actividades',   icon: Activity },
  { id: 'contratos',    label: 'Contratos',     icon: FileText },
  { id: 'contactos',    label: 'Contactos',     icon: Users },
];

export const BOTTOM_NAV_ITEMS = [
  { id: 'usuarios', label: 'Usuarios', icon: UserCog },
];

const MOBILE_PRIMARY = [
  { id: 'dashboard',  label: 'Inicio',    icon: LayoutDashboard },
  { id: 'notas',      label: 'Notas',     icon: NotebookPen },
  { id: 'tareas',     label: 'Tareas',    icon: CheckSquare },
  { id: 'actividades',label: 'Actividad', icon: Activity },
];

const MOBILE_MORE = [
  { id: 'proyectos',  label: 'Proyectos', icon: FolderKanban },
  { id: 'repos',      label: 'Repos',     icon: GitBranch },
  { id: 'contratos',  label: 'Contratos', icon: FileText },
  { id: 'contactos',  label: 'Contactos', icon: Users },
  { id: 'usuarios',   label: 'Usuarios',  icon: UserCog },
];

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

function useScreenSize() {
  const [size, setSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w < 640) setSize('mobile');
      else if (w < 1024) setSize('tablet');
      else setSize('desktop');
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return size;
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const screenSize = useScreenSize();
  const { data: session } = useSession();
  // @ts-expect-error extra field
  const username: string = session?.user?.username ?? session?.user?.name ?? '…';
  const handleLogout = () => signOut({ callbackUrl: '/login' });
  const handleNavigate = (id: string) => { onNavigate(id); setMoreOpen(false); };

  /* ── Mobile pill nav ──────────────────────────────────────────────────── */
  if (screenSize === 'mobile') {
    const moreIsActive = MOBILE_MORE.some(i => i.id === activeSection);
    return (
      <>
        {/* Pill */}
        <nav style={{
          position: 'fixed',
          bottom: 'calc(14px + env(safe-area-inset-bottom))',
          left: 14, right: 14, height: 62,
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: 32,
          boxShadow: 'none',
          display: 'flex', alignItems: 'center',
          zIndex: 50, paddingLeft: 4, paddingRight: 4,
        }}>
          {MOBILE_PRIMARY.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleNavigate(id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
              color: activeSection === id ? 'var(--app-text)' : 'var(--app-text-subtle)',
              transition: 'color 0.15s', flex: 1,
            }}>
              <Icon size={20} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              <span style={{ fontSize: 9.5, fontWeight: activeSection === id ? 700 : 500 }}>{label}</span>
            </button>
          ))}

          {/* FAB */}
          <div style={{ flex: '0 0 66px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button onClick={() => setMoreOpen(v => !v)} style={{
              width: 50, height: 50, borderRadius: '50%',
              background: moreIsActive || moreOpen ? 'var(--app-accent)' : 'var(--app-accent)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: 'none',
              color: 'var(--app-accent-fg)',
              transition: 'transform 0.22s ease',
              transform: moreOpen ? 'rotate(45deg)' : 'none',
              marginBottom: 16,
            }}>
              <Plus size={21} strokeWidth={2.2} />
            </button>
          </div>

          {MOBILE_PRIMARY.slice(2).map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleNavigate(id)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
              color: activeSection === id ? 'var(--app-text)' : 'var(--app-text-subtle)',
              transition: 'color 0.15s', flex: 1,
            }}>
              <Icon size={20} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              <span style={{ fontSize: 9.5, fontWeight: activeSection === id ? 700 : 500 }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Backdrop */}
        {moreOpen && (
          <div onClick={() => setMoreOpen(false)} style={{
            position: 'fixed', inset: 0,
            background: 'oklch(0 0 0 / 0.4)',
            zIndex: 48, backdropFilter: 'blur(3px)',
          }} />
        )}

        {/* Bottom sheet */}
        <div style={{
          position: 'fixed', left: 0, right: 0,
          bottom: moreOpen ? 0 : '-100%',
          background: 'var(--app-surface)',
          borderTop: '1px solid var(--app-border)',
          borderRadius: '18px 18px 0 0',
          zIndex: 49,
          paddingBottom: 'calc(90px + env(safe-area-inset-bottom))',
          boxShadow: 'none',
          transition: 'bottom 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 8px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--app-border)' }} />
          </div>
          {MOBILE_MORE.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => handleNavigate(id)} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 22px',
              background: activeSection === id ? 'var(--app-surface-hover)' : 'none',
              border: 'none', cursor: 'pointer',
              color: activeSection === id ? 'var(--app-text)' : 'var(--app-text-muted)',
              fontSize: 14.5, fontWeight: activeSection === id ? 600 : 400, textAlign: 'left',
            }}>
              <Icon size={19} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              {label}
            </button>
          ))}
        </div>
      </>
    );
  }

  /* ── Tablet / Desktop ─────────────────────────────────────────────────── */
  const isIconOnly = screenSize === 'tablet' || collapsed;

  return (
    <aside style={{
      width: isIconOnly ? 54 : 216,
      minWidth: isIconOnly ? 54 : 216,
      background: 'var(--app-sidebar)',
      borderRight: '1px solid var(--app-border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh',
      transition: 'width 0.2s ease, min-width 0.2s ease',
      overflow: 'hidden', flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: isIconOnly ? '15px 13px' : '15px 14px',
        borderBottom: '1px solid var(--app-border)',
        display: 'flex', alignItems: 'center', gap: 9,
        overflow: 'hidden', minHeight: 54,
      }}>
        <picture style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <source srcSet="/logoblanco.png" media="(prefers-color-scheme: dark)" />
          <img
            src="/logonegro.png"
            alt="Logo"
            style={{ height: isIconOnly ? 26 : 30, width: 'auto', objectFit: 'contain' }}
          />
        </picture>
        {!isIconOnly && <ThemeToggle compact />}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '6px 5px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => onNavigate(id)}
            className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
            style={{
              width: '100%', border: 'none', background: 'none',
              justifyContent: isIconOnly ? 'center' : 'flex-start',
              padding: isIconOnly ? '8px 6px' : '6px 10px', marginBottom: 1,
            }}
            title={isIconOnly ? label : undefined}
          >
            <Icon size={15} style={{ flexShrink: 0 }} />
            {!isIconOnly && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{ borderTop: '1px solid var(--app-border)' }}>
        <div style={{ padding: '5px 5px 2px' }}>
          {BOTTOM_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => onNavigate(id)}
              className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
              style={{
                width: '100%', border: 'none', background: 'none',
                justifyContent: isIconOnly ? 'center' : 'flex-start',
                padding: isIconOnly ? '8px 6px' : '6px 10px', marginBottom: 1,
              }}
              title={isIconOnly ? label : undefined}
            >
              <Icon size={15} style={{ flexShrink: 0 }} />
              {!isIconOnly && <span>{label}</span>}
            </button>
          ))}
        </div>

        {/* User row */}
        <div style={{
          margin: '2px 5px 5px',
          padding: isIconOnly ? '7px 5px' : '7px 9px',
          borderRadius: 6, background: 'var(--app-surface-hover)',
          display: 'flex', alignItems: 'center',
          gap: isIconOnly ? 0 : 8,
          justifyContent: isIconOnly ? 'center' : 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden', minWidth: 0 }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%',
              background: 'var(--app-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={12} color="var(--app-accent-fg)" />
            </div>
            {!isIconOnly && (
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {username}
              </span>
            )}
          </div>
          <button onClick={handleLogout} title="Cerrar sesión" style={{
            padding: '3px 4px', border: 'none', background: 'none',
            cursor: 'pointer', color: 'var(--app-text-subtle)',
            display: 'flex', alignItems: 'center', borderRadius: 4, flexShrink: 0,
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'oklch(0.577 0.245 27.325)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--app-text-subtle)'}
          >
            <LogOut size={13} />
          </button>
        </div>

        {/* Collapse */}
        {screenSize === 'desktop' && (
          <button onClick={() => setCollapsed(!collapsed)} style={{
            width: 'calc(100% - 10px)', margin: '0 5px 5px',
            padding: '5px 5px', border: '1px solid var(--app-border)',
            borderRadius: 5, background: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
            justifyContent: isIconOnly ? 'center' : 'flex-start',
            color: 'var(--app-text-muted)', fontSize: 12,
            transition: 'background 0.1s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'none'}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
            {!isIconOnly && <span style={{ marginLeft: 6 }}>Colapsar</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
