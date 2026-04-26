'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { projectStatusBadge } from '@/lib/badges';
import { formatDate } from '@/lib/storage';
import type { Project, ProjectStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_OPTIONS: ProjectStatus[] = ['activo', 'pausado', 'completado', 'cancelado'];
const COLOR_OPTIONS = ['#0075de', '#2a9d99', '#1aae39', '#dd5b00', '#391c57', '#ff64c8', '#615d59'];

function ProjectForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Project>;
  onSubmit: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const { data } = useApp();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'activo' as ProjectStatus,
    deadline: initial?.deadline ?? '',
    repoId: initial?.repoId ?? '',
    color: initial?.color ?? '#0075de',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <FormField label="Nombre" required>
        <input className="notion-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Nombre del proyecto" />
      </FormField>
      <FormField label="Descripción">
        <textarea className="notion-input" value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Descripción del proyecto" style={{ resize: 'vertical' }} />
      </FormField>
      <FormRow>
        <FormField label="Estado">
          <select className="notion-input" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{projectStatusBadge[s].label}</option>)}
          </select>
        </FormField>
        <FormField label="Fecha límite">
          <input type="date" className="notion-input" value={form.deadline} onChange={e => set('deadline', e.target.value)} />
        </FormField>
      </FormRow>
      <FormField label="Repositorio vinculado">
        <select className="notion-input" value={form.repoId} onChange={e => set('repoId', e.target.value)}>
          <option value="">Sin repositorio</option>
          {data.repos.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </FormField>
      <FormField label="Color">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {COLOR_OPTIONS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              style={{
                width: 24, height: 24, borderRadius: '50%', background: c, border: form.color === c ? '2px solid rgba(0,0,0,0.5)' : '2px solid transparent', cursor: 'pointer', outline: 'none',
              }}
            />
          ))}
        </div>
      </FormField>
      <FormActions onClose={onClose} />
    </form>
  );
}

export default function Proyectos() {
  const { data, addProject, updateProject, deleteProject } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Project | null>(null);

  const filtered = data.projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (p: Project) => { setEditing(p); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Proyectos"
        description={`${data.projects.length} proyectos en total`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar proyecto..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nuevo proyecto
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a39e98' }}>
            <p style={{ fontSize: 15 }}>No hay proyectos{search ? ' que coincidan' : '. Crea el primero'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
            {filtered.map(project => {
              const s = projectStatusBadge[project.status];
              const repo = data.repos.find(r => r.id === project.repoId);
              return (
                <div
                  key={project.id}
                  className="notion-card"
                  style={{ padding: '16px 18px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: project.color, flexShrink: 0, marginTop: 2 }} />
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.95)', letterSpacing: '-0.2px' }}>
                        {project.name}
                      </h3>
                    </div>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-ghost" onClick={() => openEdit(project)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                      <button className="btn-ghost" onClick={() => deleteProject(project.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  {project.description && (
                    <p style={{ fontSize: 13, color: '#615d59', lineHeight: 1.5, marginBottom: 12 }}>{project.description}</p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                    {project.deadline && (
                      <span style={{ fontSize: 11, color: '#a39e98' }}>hasta {formatDate(project.deadline)}</span>
                    )}
                    {repo && (
                      <span style={{ fontSize: 11, color: '#0075de', background: '#f2f9ff', padding: '1px 6px', borderRadius: 9999, fontWeight: 500 }}>
                        {repo.name}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Nuevo proyecto" onClose={closeModal}>
          <ProjectForm onSubmit={d => { addProject(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar proyecto" onClose={closeModal}>
          <ProjectForm
            initial={editing}
            onSubmit={d => { updateProject(editing.id, d); closeModal(); }}
            onClose={closeModal}
          />
        </Modal>
      )}
    </div>
  );
}
