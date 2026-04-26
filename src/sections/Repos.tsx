'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { repoStatusBadge, languageColors } from '@/lib/badges';
import { formatDate } from '@/lib/storage';
import type { Repo, RepoStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2, ExternalLink, Star, GitBranch } from 'lucide-react';

const STATUS_OPTIONS: RepoStatus[] = ['activo', 'en-desarrollo', 'archivado'];
const LANGUAGES = ['TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Java', 'C#', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Dart', 'CSS', 'HTML', 'Shell', 'Otro'];

function RepoForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Repo>;
  onSubmit: (data: Omit<Repo, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    description: initial?.description ?? '',
    language: initial?.language ?? 'TypeScript',
    status: initial?.status ?? 'activo' as RepoStatus,
    url: initial?.url ?? '',
    lastUpdated: initial?.lastUpdated ?? new Date().toISOString().split('T')[0],
    stars: initial?.stars ?? 0,
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, lastUpdated: new Date(form.lastUpdated).toISOString() }); }}>
      <FormRow>
        <FormField label="Nombre del repo" required>
          <input className="notion-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="nombre-del-repo" />
        </FormField>
        <FormField label="Lenguaje">
          <select className="notion-input" value={form.language} onChange={e => set('language', e.target.value)}>
            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormField label="Descripción">
        <textarea className="notion-input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} placeholder="Qué hace este repositorio" style={{ resize: 'vertical' }} />
      </FormField>
      <FormRow>
        <FormField label="Estado">
          <select className="notion-input" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{repoStatusBadge[s].label}</option>)}
          </select>
        </FormField>
        <FormField label="Estrellas">
          <input type="number" className="notion-input" value={form.stars} onChange={e => set('stars', parseInt(e.target.value) || 0)} min={0} />
        </FormField>
      </FormRow>
      <FormField label="URL del repositorio">
        <input className="notion-input" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://github.com/usuario/repo" />
      </FormField>
      <FormActions onClose={onClose} />
    </form>
  );
}

export default function Repos() {
  const { data, addRepo, updateRepo, deleteRepo } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Repo | null>(null);

  const filtered = data.repos.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.description.toLowerCase().includes(search.toLowerCase()) ||
    r.language.toLowerCase().includes(search.toLowerCase())
  );

  const openEdit = (r: Repo) => { setEditing(r); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Repositorios"
        description={`${data.repos.length} repositorios`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar repo..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nuevo repo
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a39e98' }}>
            <p style={{ fontSize: 15 }}>No hay repositorios{search ? ' que coincidan' : '. Agrega el primero'}</p>
          </div>
        ) : (
          <>
          {/* Card view — shown on mobile */}
          <div className="notion-cards-mobile" style={{ display: 'none', flexDirection: 'column', gap: 10 }}>
            {filtered.map(repo => {
              const s = repoStatusBadge[repo.status];
              const langColor = languageColors[repo.language] || languageColors.default;
              return (
                <div key={repo.id} className="notion-card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'rgba(0,0,0,0.9)', marginBottom: 2 }}>{repo.name}</div>
                      {repo.description && <div style={{ fontSize: 12, color: '#a39e98' }}>{repo.description}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {repo.url && <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '3px 6px', display: 'flex', color: '#0075de' }}><ExternalLink size={13} /></a>}
                      <button className="btn-ghost" onClick={() => openEdit(repo)} style={{ padding: '3px 6px' }}><Pencil size={13} /></button>
                      <button className="btn-ghost" onClick={() => deleteRepo(repo.id)} style={{ padding: '3px 6px', color: '#dc2626' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: langColor, display: 'inline-block' }} />
                      <span style={{ fontSize: 12, color: '#615d59' }}>{repo.language}</span>
                    </span>
                    <span style={{ fontSize: 11, color: '#a39e98' }}>{formatDate(repo.lastUpdated)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Table view — hidden on mobile */}
          <div className="notion-table-wrap notion-card" style={{ overflow: 'hidden' }}>
            <table className="notion-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Lenguaje</th>
                  <th>Estado</th>
                  <th>Estrellas</th>
                  <th>Actualizado</th>
                  <th style={{ width: 80 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(repo => {
                  const s = repoStatusBadge[repo.status];
                  const langColor = languageColors[repo.language] || languageColors.default;
                  return (
                    <tr key={repo.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <GitBranch size={14} style={{ color: '#a39e98', flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 14, color: 'rgba(0,0,0,0.9)' }}>{repo.name}</div>
                            {repo.description && (
                              <div style={{ fontSize: 12, color: '#a39e98', marginTop: 1 }}>{repo.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ width: 10, height: 10, borderRadius: '50%', background: langColor, display: 'inline-block' }} />
                          <span style={{ fontSize: 13, color: '#615d59' }}>{repo.language}</span>
                        </span>
                      </td>
                      <td><Badge label={s.label} bg={s.bg} text={s.text} size="sm" /></td>
                      <td>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#615d59' }}>
                          <Star size={12} style={{ color: '#ca8a04' }} /> {repo.stars}
                        </span>
                      </td>
                      <td style={{ fontSize: 13, color: '#a39e98' }}>{formatDate(repo.lastUpdated)}</td>
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
