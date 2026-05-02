'use client';

import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/lib/context';
import { repoStatusBadge, languageColors } from '@/lib/badges';
import { formatDate } from '@/lib/storage';
import type { Repo, RepoStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2, ExternalLink, Star, GitBranch, ChevronDown, X, Zap } from 'lucide-react';

const STATUS_OPTIONS: RepoStatus[] = ['activo', 'en-desarrollo', 'archivado'];

/* ── Activity Heatmap Dashboard ─────────────────────────────────────────── */
function RepoDashboard() {
  const { data } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Construir mapa de actividad: { 'YYYY-MM-DD': count }
  const activityMap = data.activities.reduce<Record<string, number>>((acc, a) => {
    const day = a.date.slice(0, 10);
    acc[day] = (acc[day] ?? 0) + 1;
    return acc;
  }, {});

  // Solo año 2026 — del domingo anterior al 1 ene hasta hoy
  const today = new Date();
  const yearStart = new Date(2026, 0, 1);
  yearStart.setDate(yearStart.getDate() - yearStart.getDay()); // retroceder al domingo

  const weeks: { date: Date; count: number }[][] = [];
  const cursor = new Date(yearStart);
  while (cursor <= today) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      week.push({ date: new Date(cursor), count: activityMap[iso] ?? 0 });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }

  const cellColor = (count: number) => {
    if (count === 0) return 'var(--app-border)';
    if (count <= 2) return '#0075de40';
    if (count <= 4) return '#0075de90';
    return '#0075de';
  };

  // Stats
  const totalStars = data.repos.reduce((s, r) => s + (r.stars ?? 0), 0);
  const activeRepos = data.repos.filter(r => r.status === 'activo').length;
  const techCount = data.repos.flatMap(r => r.stack ?? []).reduce<Record<string, number>>((acc, t) => {
    acc[t] = (acc[t] ?? 0) + 1; return acc;
  }, {});
  const topTechs = Object.entries(techCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  const recentActivities = [...data.activities]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const totalActivity = data.activities.length;
  const thisWeekActivity = data.activities.filter(a => {
    const d = new Date(a.date);
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    return d >= weekAgo;
  }).length;

  // Meses para el eje X
  const monthLabels: { label: string; col: number }[] = [];
  weeks.forEach((week, i) => {
    const d = week[0].date;
    if (d.getDate() <= 7) {
      monthLabels.push({ label: d.toLocaleDateString('es-ES', { month: 'short' }), col: i });
    }
  });


  return (
    <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Stats rápidos */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { label: 'Repos activos', value: activeRepos, total: data.repos.length },
          { label: 'Estrellas', value: totalStars },
          { label: 'Actividades', value: totalActivity },
          { label: 'Esta semana', value: thisWeekActivity, suffix: 'registros' },
        ].map(({ label, value, total, suffix }) => (
          <div key={label} className="notion-card" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--app-accent)', lineHeight: 1 }}>
              {value}{total !== undefined ? <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--app-text-subtle)' }}>/{total}</span> : null}
            </div>
            <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 3 }}>
              {suffix ?? label}
            </div>
          </div>
        ))}
      </div>

      {/* Heatmap — full width */}
      <div className="notion-card" style={{ padding: '12px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Zap size={12} /> Actividad 2026
          </span>
          <span style={{ fontWeight: 400, color: 'var(--app-text-subtle)' }}>{totalActivity} registros totales</span>
        </div>

        {/* Layout: etiquetas de día (columna fija) + semanas (flex, relativas para mes labels) */}
        <div style={{ display: 'flex', gap: 4, width: '100%' }}>
          {/* Etiquetas de días */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 16, flexShrink: 0 }}>
            {['D','L','M','X','J','V','S'].map(d => (
              <div key={d} style={{ height: 11, fontSize: 8, color: 'var(--app-text-subtle)', lineHeight: '11px', textAlign: 'right', width: 10 }}>{d}</div>
            ))}
          </div>

          {/* Semanas + meses */}
          <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
            {/* Etiquetas de mes (posicionadas absolutas sobre las semanas) */}
            <div style={{ height: 14, position: 'relative', marginBottom: 2 }}>
              {monthLabels.map(({ label, col }) => (
                <span key={label} style={{
                  position: 'absolute',
                  left: `${(col / weeks.length) * 100}%`,
                  fontSize: 9, color: 'var(--app-text-subtle)',
                  whiteSpace: 'nowrap', lineHeight: '14px',
                }}>
                  {label}
                </span>
              ))}
            </div>

            {/* Semanas como columnas flex — cada una es un bloque visual */}
            <div style={{ display: 'flex', gap: 3, width: '100%' }}>
              {weeks.map((week, wi) => {
                const isCurrentWeek = week.some(({ date }) => {
                  const d = new Date(date);
                  const t = new Date(today);
                  return d.toDateString() === t.toDateString();
                });
                return (
                  <div
                    key={wi}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      borderRadius: 3,
                      padding: '1px',
                      background: isCurrentWeek ? 'rgba(0,117,222,0.06)' : 'transparent',
                      outline: isCurrentWeek ? '1px solid rgba(0,117,222,0.2)' : 'none',
                    }}
                  >
                    {week.map(({ date, count }, di) => (
                      <div
                        key={di}
                        title={`${date.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}: ${count} actividad${count !== 1 ? 'es' : ''}`}
                        style={{
                          height: 11,
                          borderRadius: 2,
                          background: date > today ? 'transparent' : cellColor(count),
                          cursor: count > 0 ? 'pointer' : 'default',
                        }}
                      />
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 9, color: 'var(--app-text-subtle)' }}>Menos</span>
          {[0, 1, 3, 5].map(v => (
            <div key={v} style={{ width: 10, height: 10, borderRadius: 2, background: cellColor(v) }} />
          ))}
          <span style={{ fontSize: 9, color: 'var(--app-text-subtle)' }}>Más</span>
        </div>
      </div>

      {/* Fila inferior: stack + actividad reciente (solo si hay datos) */}
      {(topTechs.length > 0 || recentActivities.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: topTechs.length > 0 && recentActivities.length > 0 ? (isMobile ? '1fr' : '1fr 1fr') : '1fr', gap: 10 }}>
          {/* Top techs */}
          {topTechs.length > 0 && (
            <div className="notion-card" style={{ padding: '10px 14px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 8 }}>Stack más usado</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {topTechs.map(([tech, count]) => {
                  const color = languageColors[tech] ?? languageColors.default;
                  const pct = Math.round((count / data.repos.length) * 100);
                  return (
                    <div key={tech}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--app-text)', marginBottom: 3 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, display: 'inline-block' }} />
                          {tech}
                        </span>
                        <span style={{ color: 'var(--app-text-subtle)' }}>{count}</span>
                      </div>
                      <div style={{ height: 3, borderRadius: 2, background: 'var(--app-border)' }}>
                        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 2, background: color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actividad reciente */}
          {recentActivities.length > 0 && (
            <div className="notion-card" style={{ padding: '10px 14px', flex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 8 }}>Actividad reciente</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {recentActivities.map(a => (
                  <div key={a.id} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--app-accent)', marginTop: 4, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: 'var(--app-text)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.description}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', marginTop: 1 }}>
                        {new Date(a.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STACK_OPTIONS = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'PHP',
  'Ruby', 'Swift', 'Kotlin', 'Dart', 'CSS', 'HTML', 'Shell',
  'React', 'Next.js', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Express', 'FastAPI', 'Django', 'Rails',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'SQLite',
  'Docker', 'Kubernetes', 'AWS', 'GCP', 'Azure',
  'GraphQL', 'REST', 'tRPC', 'Prisma', 'Drizzle',
  'Tailwind', 'Sass', 'Figma', 'Storybook',
  'Otro',
];

/* ── StackPill: chip individual ─────────────────────────────────────────── */
function StackPill({ tech, onRemove }: { tech: string; onRemove?: () => void }) {
  const color = languageColors[tech] ?? languageColors.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 99,
      background: color + '20', border: `1px solid ${color}40`,
      fontSize: 11, fontWeight: 600, color,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {tech}
      {onRemove && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); onRemove(); }}
          style={{
            background: 'none', border: 'none', padding: 0, cursor: 'pointer',
            display: 'flex', alignItems: 'center', color, opacity: 0.7,
            lineHeight: 1,
          }}
        >
          <X size={10} />
        </button>
      )}
    </span>
  );
}

/* ── StackSelect: multi-select con dropdown ─────────────────────────────── */
function StackSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = STACK_OPTIONS.filter(o =>
    o.toLowerCase().includes(search.toLowerCase()) && !value.includes(o)
  );

  const toggle = (tech: string) => {
    if (value.includes(tech)) onChange(value.filter(v => v !== tech));
    else onChange([...value, tech]);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(v => !v)}
        style={{
          minHeight: 36, padding: '4px 8px',
          border: '1px solid var(--app-border)',
          borderRadius: 6, background: 'var(--app-bg)',
          cursor: 'pointer', display: 'flex', flexWrap: 'wrap',
          gap: 4, alignItems: 'center',
          transition: 'border-color 0.15s',
          ...(open ? { borderColor: 'var(--app-accent)', outline: '2px solid rgba(0,117,222,0.15)' } : {}),
        }}
      >
        {value.length === 0 && (
          <span style={{ fontSize: 13, color: 'var(--app-text-subtle)', padding: '0 2px' }}>
            Seleccionar tecnologías…
          </span>
        )}
        {value.map(tech => (
          <StackPill key={tech} tech={tech} onRemove={() => toggle(tech)} />
        ))}
        <span style={{ marginLeft: 'auto', color: 'var(--app-text-subtle)', display: 'flex' }}>
          <ChevronDown size={14} />
        </span>
      </div>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
          background: 'var(--app-surface)',
          border: '1px solid var(--app-border)',
          borderRadius: 8,
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          {/* Search inside dropdown */}
          <div style={{ padding: '8px 8px 4px', borderBottom: '1px solid var(--app-border)' }}>
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar tecnología…"
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', padding: '5px 8px', border: '1px solid var(--app-border)',
                borderRadius: 5, fontSize: 12, background: 'var(--app-bg)',
                color: 'var(--app-text)', outline: 'none',
              }}
            />
          </div>

          {/* Selected (shown at top when selected) */}
          {value.length > 0 && (
            <div style={{ padding: '6px 8px', borderBottom: '1px solid var(--app-border)', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {value.map(tech => (
                <StackPill key={tech} tech={tech} onRemove={() => toggle(tech)} />
              ))}
            </div>
          )}

          {/* Options list */}
          <div style={{ maxHeight: 220, overflowY: 'auto', padding: '4px 0' }}>
            {filtered.length === 0 ? (
              <div style={{ padding: '10px 12px', fontSize: 12, color: 'var(--app-text-subtle)', textAlign: 'center' }}>
                Sin resultados
              </div>
            ) : (
              filtered.map(tech => {
                const color = languageColors[tech] ?? languageColors.default;
                return (
                  <button
                    key={tech}
                    type="button"
                    onClick={() => toggle(tech)}
                    style={{
                      width: '100%', padding: '6px 12px', border: 'none',
                      background: 'transparent', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 8,
                      textAlign: 'left', fontSize: 13, color: 'var(--app-text)',
                      transition: 'background 0.1s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--app-surface-hover)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                    {tech}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Form ────────────────────────────────────────────────────────────────── */
function RepoForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Repo>;
  onSubmit: (data: Omit<Repo, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    stack: initial?.stack ?? [] as string[],
    status: (initial?.status ?? 'activo') as RepoStatus,
    url: initial?.url ?? '',
    lastUpdated: initial?.lastUpdated ?? new Date().toISOString().split('T')[0],
    stars: initial?.stars ?? 0,
  });

  const set = (k: string, v: string | number | string[]) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, lastUpdated: new Date(form.lastUpdated).toISOString() }); }}>
      <FormRow>
        <FormField label="Nombre del repo" required>
          <input className="notion-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="nombre-del-repo" />
        </FormField>
        <FormField label="Estado">
          <select className="notion-input" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{repoStatusBadge[s].label}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormField label="Stack tecnológico">
        <StackSelect value={form.stack} onChange={v => set('stack', v)} />
      </FormField>
      <FormField label="Descripción">
        <textarea className="notion-input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Qué hace este repositorio" style={{ resize: 'vertical' }} />
      </FormField>
      <FormRow>
        <FormField label="URL del repositorio">
          <input className="notion-input" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://github.com/usuario/repo" />
        </FormField>
        <FormField label="Estrellas">
          <input type="number" className="notion-input" value={form.stars} onChange={e => set('stars', parseInt(e.target.value) || 0)} min={0} />
        </FormField>
      </FormRow>
      <FormActions onClose={onClose} />
    </form>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function Repos() {
  const { data, addRepo, updateRepo, deleteRepo } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Repo | null>(null);

  const filtered = data.repos.filter(r => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q) ||
      (r.stack ?? []).some(s => s.toLowerCase().includes(q))
    );
  });

  const openEdit = (r: Repo) => { setEditing(r); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Repositorios"
        description={`${data.repos.length} repositorios`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar repo o tecnología..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nuevo repo
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        <RepoDashboard />
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--app-text-subtle)' }}>
            <p style={{ fontSize: 15 }}>No hay repositorios{search ? ' que coincidan' : '. Agrega el primero'}</p>
          </div>
        ) : (
          <>
          {/* Card view — mobile */}
          <div className="notion-cards-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
            {filtered.map(repo => {
              const s = repoStatusBadge[repo.status];
              const stack = repo.stack ?? [];
              return (
                <div key={repo.id} className="notion-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--app-text)', marginBottom: 2 }}>{repo.name}</div>
                      {repo.description && <div style={{ fontSize: 12, color: 'var(--app-text-subtle)' }}>{repo.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {repo.url && <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '3px 6px', display: 'flex', color: '#0075de' }}><ExternalLink size={13} /></a>}
                      <button className="btn-ghost" onClick={() => openEdit(repo)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                      <button className="btn-ghost" onClick={() => deleteRepo(repo.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                    {stack.map(tech => <StackPill key={tech} tech={tech} />)}
                    <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>{formatDate(repo.lastUpdated)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Table view — desktop */}
          <div className="notion-table-wrap notion-card" style={{ overflow: 'hidden' }}>
            <table className="notion-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Stack</th>
                  <th>Estado</th>
                  <th>Estrellas</th>
                  <th>Actualizado</th>
                  <th style={{ width: 80 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(repo => {
                  const s = repoStatusBadge[repo.status];
                  const stack = repo.stack ?? [];
                  return (
                    <tr key={repo.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GitBranch size={14} style={{ color: 'var(--app-text-subtle)', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--app-text)' }}>{repo.name}</div>
                            {repo.description && (
                              <div style={{ fontSize: 12, color: 'var(--app-text-subtle)', marginTop: 1 }}>{repo.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {stack.length > 0
                            ? stack.map(tech => <StackPill key={tech} tech={tech} />)
                            : <span style={{ fontSize: 12, color: 'var(--app-text-subtle)' }}>—</span>
                          }
                        </div>
                      </td>
                      <td><Badge label={s.label} bg={s.bg} text={s.text} size="sm" /></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--app-text-muted)' }}>
                          <Star size={12} style={{ color: '#ca8a04' }} /> {repo.stars}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: 'var(--app-text-subtle)' }}>{formatDate(repo.lastUpdated)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          {repo.url && (
                            <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '3px 6px', display: 'flex', color: '#0075de' }}>
                              <ExternalLink size={13} />
                            </a>
                          )}
                          <button className="btn-ghost" onClick={() => openEdit(repo)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                          <button className="btn-ghost" onClick={() => deleteRepo(repo.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Nuevo repositorio" onClose={closeModal}>
          <RepoForm onSubmit={d => { addRepo(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar repositorio" onClose={closeModal}>
          <RepoForm initial={editing} onSubmit={d => { updateRepo(editing.id, d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
