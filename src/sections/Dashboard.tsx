'use client';

import { useApp } from '@/lib/context';
import { formatDate } from '@/lib/storage';
import { taskStatusBadge } from '@/lib/badges';
import Badge from '@/components/Badge';
import { FolderKanban, CheckSquare, FileText, Users, Activity, GitBranch, TrendingUp, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface DashboardProps {
  onNavigate: (section: string) => void;
}

function useIsNarrow(breakpoint = 1024) {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const check = () => setNarrow(window.innerWidth < breakpoint);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [breakpoint]);
  return narrow;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { data } = useApp();
  const isNarrow = useIsNarrow(1024);
  const isMobile = useIsNarrow(640);
  const { data: session } = useSession();
  // @ts-expect-error extra field
  const username: string = session?.user?.username ?? session?.user?.name ?? '';

  const activeProjects = data.projects.filter(p => p.status === 'activo').length;
  const pendingTasks = data.tasks.filter(t => !t.completed).length;
  const completedTasks = data.tasks.filter(t => t.completed).length;
  const activeContracts = data.contracts.filter(c => c.status === 'activo');
  const totalContractValue = activeContracts.reduce((sum, c) => sum + c.value, 0);
  const recentActivities = [...data.activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const upcomingTasks = data.tasks
    .filter(t => !t.completed && t.dueDate)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const metrics = [
    { label: 'Proyectos activos', value: activeProjects, icon: FolderKanban, color: '#0075de', section: 'proyectos' },
    { label: 'Tareas pendientes', value: pendingTasks, icon: CheckSquare, color: '#dd5b00', section: 'tareas' },
    { label: 'Contratos activos', value: activeContracts.length, icon: FileText, color: '#2a9d99', section: 'contratos' },
    { label: 'Contactos', value: data.contacts.length, icon: Users, color: '#391c57', section: 'contactos' },
    { label: 'Repos', value: data.repos.length, icon: GitBranch, color: '#615d59', section: 'repos' },
    { label: 'Tareas completadas', value: completedTasks, icon: TrendingUp, color: '#1aae39', section: 'tareas' },
  ];

  return (
    <div className="page-enter page-padding" style={{ overflow: 'auto', height: '100%' }}>
      {/* Welcome */}
      <div style={{ marginBottom: 16 }}>
        {/* Fila logo + admin (solo mobile) */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <picture style={{ display: 'flex', alignItems: 'center' }}>
              <source srcSet="/logoblanco.png" media="(prefers-color-scheme: dark)" />
              <img src="/logonegro.png" alt="Logo" style={{ height: 34, width: 'auto', objectFit: 'contain' }} />
            </picture>
            {username && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '4px 8px 4px 4px', borderRadius: 20,
                background: 'var(--app-surface-hover)', border: '1px solid var(--app-border)',
                flexShrink: 0,
              }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--app-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={11} color="var(--app-accent-fg)" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', maxWidth: 56, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {username}
                </span>
                <button onClick={() => signOut({ callbackUrl: '/login' })} title="Cerrar sesión"
                  style={{ padding: 0, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--app-text-subtle)', display: 'flex', lineHeight: 1 }}>
                  <LogOut size={11} />
                </button>
              </div>
            )}
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <h2 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.4px', marginBottom: 4 }}>
            {isMobile ? 'Workspace' : 'Bienvenido a tu workspace'}
          </h2>
        </div>
        <p style={{ fontSize: 14, color: 'var(--app-text-muted)' }}>
          {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Metrics grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: isNarrow ? 8 : 12, marginBottom: 16 }}>
        {metrics.map(({ label, value, icon: Icon, color, section }) => (
          <button
            key={label}
            onClick={() => onNavigate(section)}
            className="notion-card"
            style={{
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              background: 'var(--app-surface)',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              width: '100%',
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: color + '15',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} style={{ color }} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--app-text)', lineHeight: 1.2 }}>
                {value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--app-text-muted)', marginTop: 1 }}>{label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Contract value banner */}
      {activeContracts.length > 0 && (
        <div
          className="notion-card"
          style={{
            padding: '12px 16px',
            background: 'rgba(0,117,222,0.07)',
            marginBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#097fe8', marginBottom: 2 }}>
              VALOR EN CONTRATOS ACTIVOS
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.5px' }}>
              ${totalContractValue.toLocaleString('es-ES')}
            </div>
          </div>
          <button className="btn-primary" onClick={() => onNavigate('contratos')} style={{ fontSize: 13 }}>
            Ver contratos
          </button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isNarrow ? '1fr' : '1fr 1fr', gap: isNarrow ? 12 : 16 }}>
        {/* Upcoming tasks */}
        <div className="notion-card" style={{ padding: '0' }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--app-border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text)' }}>Tareas próximas</h3>
          </div>
          <div>
            {upcomingTasks.length === 0 ? (
              <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--app-text-subtle)', textAlign: 'center' }}>
                Sin tareas pendientes
              </div>
            ) : (
              upcomingTasks.map(task => {
                const s = taskStatusBadge[task.status];
                return (
                  <div
                    key={task.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--app-border)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <input type="checkbox" className="notion-checkbox" checked={task.completed} readOnly />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {task.title}
                      </div>
                      {task.dueDate && (
                        <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 1 }}>{formatDate(task.dueDate)}</div>
                      )}
                    </div>
                    <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent activities */}
        <div className="notion-card" style={{ padding: '0' }}>
          <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--app-border)' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--app-text)' }}>Actividad reciente</h3>
          </div>
          <div>
            {recentActivities.length === 0 ? (
              <div style={{ padding: '20px 16px', fontSize: 13, color: 'var(--app-text-subtle)', textAlign: 'center' }}>
                Sin actividades registradas
              </div>
            ) : (
              recentActivities.map(act => {
                const project = data.projects.find(p => p.id === act.projectId);
                return (
                  <div
                    key={act.id}
                    style={{
                      padding: '10px 16px',
                      borderBottom: '1px solid var(--app-border)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--app-text)', flex: 1, marginRight: 8 }}>
                        {act.description}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: '#0075de',
                          background: 'rgba(0,117,222,0.12)',
                          padding: '1px 6px',
                          borderRadius: 9999,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {act.duration}m
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 2 }}>
                      {project ? project.name : ''} · {formatDate(act.date)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
