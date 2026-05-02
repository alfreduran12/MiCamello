'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { formatDate, formatDuration } from '@/lib/storage';
import type { Activity } from '@/lib/types';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2, Clock } from 'lucide-react';

const ACTIVITY_TYPES = ['desarrollo', 'reunión', 'diseño', 'revisión', 'documentación', 'deploy', 'investigación', 'otro'];

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  desarrollo: { bg: 'rgba(0,117,222,0.12)', text: '#097fe8' },
  'reunión': { bg: 'rgba(194,65,12,0.12)', text: '#c2410c' },
  diseño: { bg: 'rgba(124,58,237,0.12)', text: '#7c3aed' },
  revisión: { bg: 'rgba(22,163,74,0.12)', text: '#16a34a' },
  documentación: { bg: 'rgba(97,93,89,0.12)', text: '#97938f' },
  deploy: { bg: 'rgba(202,138,4,0.12)', text: '#ca8a04' },
  investigación: { bg: 'rgba(3,105,161,0.12)', text: '#0369a1' },
  otro: { bg: 'rgba(97,93,89,0.08)', text: '#97938f' },
};

function ActivityForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Activity>;
  onSubmit: (data: Omit<Activity, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const { data } = useApp();
  const [form, setForm] = useState({
    date: initial?.date ? initial.date.split('T')[0] : new Date().toISOString().split('T')[0],
    projectId: initial?.projectId ?? '',
    description: initial?.description ?? '',
    duration: initial?.duration ?? 60,
    type: initial?.type ?? 'desarrollo',
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSubmit({ ...form, date: new Date(form.date).toISOString(), duration: Number(form.duration) });
    }}>
      <FormField label="Descripción" required>
        <textarea className="notion-input" value={form.description} onChange={e => set('description', e.target.value)} required rows={3} placeholder="¿Qué hiciste?" style={{ resize: 'vertical' }} />
      </FormField>
      <FormRow>
        <FormField label="Fecha">
          <input type="date" className="notion-input" value={form.date} onChange={e => set('date', e.target.value)} />
        </FormField>
        <FormField label="Duración (minutos)">
          <input type="number" className="notion-input" value={form.duration} onChange={e => set('duration', parseInt(e.target.value) || 0)} min={1} step={15} />
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Tipo">
          <select className="notion-input" value={form.type} onChange={e => set('type', e.target.value)}>
            {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </FormField>
        <FormField label="Proyecto">
          <select className="notion-input" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
            <option value="">Sin proyecto</option>
            {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormActions onClose={onClose} />
    </form>
  );
}

export default function Actividades() {
  const { data, addActivity, updateActivity, deleteActivity } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Activity | null>(null);

  const sorted = [...data.activities].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const filtered = sorted.filter(a =>
    a.description.toLowerCase().includes(search.toLowerCase()) ||
    a.type.toLowerCase().includes(search.toLowerCase())
  );

  const totalMinutes = filtered.reduce((sum, a) => sum + a.duration, 0);
  const openEdit = (a: Activity) => { setEditing(a); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  // Group by date
  const grouped = filtered.reduce<Record<string, Activity[]>>((acc, act) => {
    const key = new Date(act.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Actividades"
        description={`${filtered.length} registros · ${formatDuration(totalMinutes)} total`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar actividad..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Registrar actividad
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {Object.keys(grouped).length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--app-text-subtle)' }}>
            <p style={{ fontSize: 15 }}>No hay actividades{search ? ' que coincidan' : '. Registra la primera'}</p>
          </div>
        ) : (
          Object.entries(grouped).map(([dateStr, acts]) => (
            <div key={dateStr} style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--app-text-subtle)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 8 }}>
                {dateStr} · {formatDuration(acts.reduce((s, a) => s + a.duration, 0))}
              </div>
              <div className="notion-card" style={{ overflow: 'hidden' }}>
                {acts.map((act, idx) => {
                  const typeStyle = TYPE_COLORS[act.type] || TYPE_COLORS.otro;
                  const project = data.projects.find(p => p.id === act.projectId);
                  return (
                    <div
                      key={act.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 16px',
                        borderBottom: idx < acts.length - 1 ? '1px solid var(--app-border)' : 'none',
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: typeStyle.text,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text)' }}>{act.description}</div>
                        <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center' }}>
                          <span style={{ fontSize: 11, color: typeStyle.text, background: typeStyle.bg, padding: '1px 7px', borderRadius: 9999, fontWeight: 600 }}>
                            {act.type}
                          </span>
                          {project && (
                            <span style={{ fontSize: 11, color: '#0075de', background: 'rgba(0,117,222,0.12)', padding: '1px 7px', borderRadius: 9999 }}>
                              {project.name}
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: 'var(--app-text-muted)', fontWeight: 500 }}>
                          <Clock size={12} /> {formatDuration(act.duration)}
                        </span>
                        <button className="btn-ghost" onClick={() => openEdit(act)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                        <button className="btn-ghost" onClick={() => deleteActivity(act.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Registrar actividad" onClose={closeModal}>
          <ActivityForm onSubmit={d => { addActivity(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar actividad" onClose={closeModal}>
          <ActivityForm initial={editing} onSubmit={d => { updateActivity(editing.id, d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
