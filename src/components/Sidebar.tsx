'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  FolderKanban,
  GitBranch,
  CheckSquare,
  Activity,
  FileText,
  Users,
  UserCog,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Plus,
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  { id: 'repos', label: 'Repos', icon: GitBranch },
  { id: 'tareas', label: 'Tareas', icon: CheckSquare },
  { id: 'actividades', label: 'Actividades', icon: Activity },
  { id: 'contratos', label: 'Contratos', icon: FileText },
  { id: 'contactos', label: 'Contactos', icon: Users },
];

export const BOTTOM_NAV_ITEMS = [
  { id: 'usuarios', label: 'Usuarios', icon: UserCog },
];

// Items que van en la pill principal mobile (4 + FAB central)
const MOBILE_PRIMARY = [
  { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
  { id: 'proyectos', label: 'Proyectos', icon: FolderKanban },
  // FAB goes here (index 2)
  { id: 'tareas', label: 'Tareas', icon: CheckSquare },
  { id: 'actividades', label: 'Actividad', icon: Activity },
];

// Items del drawer del FAB "+"
const MOBILE_MORE = [
  { id: 'repos', label: 'Repos', icon: GitBranch },
  { id: 'contratos', label: 'Contratos', icon: FileText },
  { id: 'contactos', label: 'Contactos', icon: Users },
  { id: 'usuarios', label: 'Usuarios', icon: UserCog },
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

  const handleNavigate = (id: string) => {
    onNavigate(id);
    setMoreOpen(false);
  };

  // ── Mobile: floating pill + FAB + bottom drawer ──
  if (screenSize === 'mobile') {
    const moreIsActive = MOBILE_MORE.some(i => i.id === activeSection);

    return (
      <>
        {/* Pill nav — 4 items + FAB central */}
        <nav
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            left: 16,
            right: 16,
            height: 64,
            background: 'white',
            borderRadius: 32,
            boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
            display: 'flex',
            alignItems: 'center',
            zIndex: 50,
            paddingLeft: 4,
            paddingRight: 4,
          }}
        >
          {/* Izquierda: Dashboard, Proyectos */}
          {MOBILE_PRIMARY.slice(0, 2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
                color: activeSection === id ? '#0075de' : '#a39e98',
                transition: 'color 0.15s ease', flex: 1,
              }}
            >
              <Icon size={21} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              <span style={{ fontSize: 10, fontWeight: activeSection === id ? 700 : 500 }}>{label}</span>
            </button>
          ))}

          {/* FAB central */}
          <div style={{ flex: '0 0 68px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={() => setMoreOpen(v => !v)}
              style={{
                width: 52, height: 52, borderRadius: '50%',
                background: moreIsActive || moreOpen ? '#0075de' : 'rgba(0,0,0,0.88)',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 14px rgba(0,0,0,0.22)',
                color: 'white',
                transition: 'transform 0.22s ease, background 0.2s ease',
                transform: moreOpen ? 'rotate(45deg)' : 'none',
                marginBottom: 18,
              }}
            >
              <Plus size={22} strokeWidth={2.2} />
            </button>
          </div>

          {/* Derecha: Tareas, Actividades */}
          {MOBILE_PRIMARY.slice(2).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '6px 0', background: 'none', border: 'none', cursor: 'pointer',
                color: activeSection === id ? '#0075de' : '#a39e98',
                transition: 'color 0.15s ease', flex: 1,
              }}
            >
              <Icon size={21} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              <span style={{ fontSize: 10, fontWeight: activeSection === id ? 700 : 500 }}>{label}</span>
            </button>
          ))}
        </nav>

        {/* Backdrop */}
        {moreOpen && (
          <div
            onClick={() => setMoreOpen(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.30)',
              zIndex: 48, backdropFilter: 'blur(3px)',
            }}
          />
        )}

        {/* Bottom sheet FAB */}
        <div
          style={{
            position: 'fixed', left: 0, right: 0,
            bottom: moreOpen ? 0 : '-100%',
            background: 'white',
            borderRadius: '20px 20px 0 0',
            zIndex: 49,
            paddingBottom: 'calc(96px + env(safe-area-inset-bottom))',
            boxShadow: '0 -4px 30px rgba(0,0,0,0.10)',
            transition: 'bottom 0.3s cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          {/* Handle */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 8px' }}>
            <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.10)' }} />
          </div>

          {/* Items */}
          {MOBILE_MORE.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNavigate(id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '14px 24px',
                background: activeSection === id ? 'rgba(0,117,222,0.06)' : 'none',
                border: 'none', cursor: 'pointer',
                color: activeSection === id ? '#0075de' : 'rgba(0,0,0,0.85)',
                fontSize: 15, fontWeight: activeSection === id ? 600 : 400, textAlign: 'left',
              }}
            >
              <Icon size={20} strokeWidth={activeSection === id ? 2.2 : 1.7} />
              {label}
            </button>
          ))}

        </div>
      </>
    );
  }

  // ── Tablet / Desktop ──
  const isIconOnly = screenSize === 'tablet' || collapsed;

  return (
    <aside
      style={{
        width: isIconOnly ? 56 : 220,
        minWidth: isIconOnly ? 56 : 220,
        background: '#f6f5f4',
        borderRight: '1px solid rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 0.2s ease, min-width 0.2s ease',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: isIconOnly ? '16px 14px' : '16px 16px',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          overflow: 'hidden',
          minHeight: 56,
        }}
      >
        <div
          style={{
            width: 28, height: 28, borderRadius: 6, background: '#0075de',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="white" />
            <rect x="9" y="2" width="5" height="5" rx="1" fill="white" opacity="0.7" />
            <rect x="2" y="9" width="5" height="5" rx="1" fill="white" opacity="0.7" />
            <rect x="9" y="9" width="5" height="5" rx="1" fill="white" opacity="0.4" />
          </svg>
        </div>
        {!isIconOnly && (
          <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.9)', letterSpacing: '-0.3px', whiteSpace: 'nowrap' }}>
            Mi Notion
          </span>
        )}
      </div>

      {/* Nav principal */}
      <nav style={{ flex: 1, padding: '8px 6px', overflowY: 'auto' }}>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
            style={{
              width: '100%', border: 'none', background: 'none',
              justifyContent: isIconOnly ? 'center' : 'flex-start',
              padding: isIconOnly ? '8px 6px' : '6px 10px',
              marginBottom: 2,
            }}
            title={isIconOnly ? label : undefined}
          >
            <Icon size={16} style={{ flexShrink: 0 }} />
            {!isIconOnly && <span>{label}</span>}
          </button>
        ))}
      </nav>

      {/* Sección inferior */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)' }}>
        <div style={{ padding: '6px 6px 2px' }}>
          {BOTTOM_NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`sidebar-item ${activeSection === id ? 'active' : ''}`}
              style={{
                width: '100%', border: 'none', background: 'none',
                justifyContent: isIconOnly ? 'center' : 'flex-start',
                padding: isIconOnly ? '8px 6px' : '6px 10px',
                marginBottom: 2,
              }}
              title={isIconOnly ? label : undefined}
            >
              <Icon size={16} style={{ flexShrink: 0 }} />
              {!isIconOnly && <span>{label}</span>}
            </button>
          ))}
        </div>

        {/* Usuario + logout */}
        <div
          style={{
            margin: '2px 6px 6px',
            padding: isIconOnly ? '8px 6px' : '8px 10px',
            borderRadius: 6,
            background: 'rgba(0,0,0,0.03)',
            display: 'flex',
            alignItems: 'center',
            gap: isIconOnly ? 0 : 8,
            justifyContent: isIconOnly ? 'center' : 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden', minWidth: 0 }}>
            <div style={{
              width: 24, height: 24, borderRadius: '50%', background: '#0075de',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <User size={13} color="white" />
            </div>
            {!isIconOnly && (
              <span style={{
                fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.75)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {username}
              </span>
            )}
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            style={{
              padding: '4px 5px', border: 'none', background: 'none',
              cursor: 'pointer', color: '#a39e98', display: 'flex',
              alignItems: 'center', borderRadius: 4, flexShrink: 0,
              transition: 'color 0.15s ease, background 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#dc2626';
              (e.currentTarget as HTMLButtonElement).style.background = 'rgba(220,38,38,0.06)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.color = '#a39e98';
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            <LogOut size={14} />
          </button>
        </div>

        {/* Collapse — solo desktop */}
        {screenSize === 'desktop' && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: 'calc(100% - 12px)', margin: '0 6px 6px',
              padding: '5px 6px', border: '1px solid rgba(0,0,0,0.08)',
              borderRadius: 5, background: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
              justifyContent: isIconOnly ? 'center' : 'flex-start',
              color: '#615d59',
            }}
            title={collapsed ? 'Expandir' : 'Colapsar'}
          >
            {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            {!isIconOnly && <span style={{ marginLeft: 7, fontSize: 12 }}>Colapsar</span>}
          </button>
        )}
      </div>
    </aside>
  );
}
