'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { taskStatusBadge, priorityBadge } from '@/lib/badges';
import { formatDate } from '@/lib/storage';
import type { Task, TaskStatus, TaskPriority } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_OPTIONS: TaskStatus[] = ['pendiente', 'en-progreso', 'completada', 'bloqueada'];
const PRIORITY_OPTIONS: TaskPriority[] = ['baja', 'media', 'alta', 'urgente'];

function TaskForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Task>;
  onSubmit: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const { data } = useApp();
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    status: initial?.status ?? 'pendiente' as TaskStatus,
    priority: initial?.priority ?? 'media' as TaskPriority,
    projectId: initial?.projectId ?? '',
    dueDate: initial?.dueDate ?? '',
    completed: initial?.completed ?? false,
  });

  const set = (k: string, v: string | boolean) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      <FormField label="Título" required>
        <input className="notion-input" value={form.title} onChange={e => set('title', e.target.value)} required placeholder="¿Qué hay que hacer?" />
      </FormField>
      <FormField label="Descripción">
        <textarea className="notion-input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Detalles adicionales" style={{ resize: 'vertical' }} />
      </FormField>
      <FormRow>
        <FormField label="Estado">
          <select className="notion-input" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{taskStatusBadge[s].label}</option>)}
          </select>
        </FormField>
        <FormField label="Prioridad">
          <select className="notion-input" value={form.priority} onChange={e => set('priority', e.target.value)}>
            {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{priorityBadge[p].label}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Proyecto">
          <select className="notion-input" value={form.projectId} onChange={e => set('projectId', e.target.value)}>
            <option value="">Sin proyecto</option>
            {data.projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </FormField>
        <FormField label="Fecha límite">
          <input type="date" className="notion-input" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </FormField>
      </FormRow>
      <FormActions onClose={onClose} />
    </form>
  );
}

export default function Tareas() {
  const { data, addTask, updateTask, deleteTask } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Task | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = data.tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const openEdit = (t: Task) => { setEditing(t); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };
  const toggleComplete = (t: Task) => updateTask(t.id, { completed: !t.completed, status: !t.completed ? 'completada' : 'pendiente' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Tareas"
        description={`${data.tasks.filter(t => !t.completed).length} pendientes · ${data.tasks.filter(t => t.completed).length} completadas`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar tarea..." />
            <select
              className="notion-input"
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ width: 140 }}
            >
              <option value="all">Todos los estados</option>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{taskStatusBadge[s].label}</option>)}
            </select>
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nueva tarea
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--app-text-subtle)' }}>
            <p style={{ fontSize: 15 }}>No hay tareas{search ? ' que coincidan' : '. Crea la primera'}</p>
          </div>
        ) : (
          <div className="notion-card" style={{ overflow: 'hidden' }}>
            {filtered.map((task, idx) => {
              const s = taskStatusBadge[task.status];
              const p = priorityBadge[task.priority];
              const project = data.projects.find(pr => pr.id === task.projectId);
              return (
                <div
                  key={task.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--app-border)' : 'none',
                    opacity: task.completed ? 0.6 : 1,
                  }}
                >
                  <input
                    type="checkbox"
                    className="notion-checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: 'var(--app-text)',
                          textDecoration: task.completed ? 'line-through' : 'none',
                        }}
                      >
                        {task.title}
                      </span>
                      <Badge label={p.label} bg={p.bg} text={p.text} size="sm" />
                    </div>
                    {task.description && (
                      <p style={{ fontSize: 12, color: 'var(--app-text-subtle)', marginTop: 2 }}>{task.description}</p>
                    )}
                    <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                      {project && (
                        <span style={{ fontSize: 11, color: '#0075de', background: 'rgba(0,117,222,0.12)', padding: '1px 6px', borderRadius: 9999 }}>
                          {project.name}
                        </span>
                      )}
                      {task.dueDate && (
                        <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>{formatDate(task.dueDate)}</span>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                    <button className="btn-ghost" onClick={() => openEdit(task)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                    <button className="btn-ghost" onClick={() => deleteTask(task.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Nueva tarea" onClose={closeModal}>
          <TaskForm onSubmit={d => { addTask(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar tarea" onClose={closeModal}>
          <TaskForm initial={editing} onSubmit={d => { updateTask(editing.id, d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
