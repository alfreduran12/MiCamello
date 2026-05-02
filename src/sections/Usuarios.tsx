'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, Pencil, Trash2, Shield, User, KeyRound } from 'lucide-react';
import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import Badge from '@/components/Badge';

interface UserRow {
  id: string;
  username: string;
  role: 'admin' | 'user';
  createdAt: string;
}

function roleBadge(role: string) {
  return role === 'admin'
    ? { label: 'Admin', text: '#391c57', bg: 'rgba(57,28,87,0.1)' }
    : { label: 'Usuario', text: '#615d59', bg: 'rgba(97,93,89,0.1)' };
}

function UserForm({ initial, onSubmit, onClose, isNew }: {
  initial?: Partial<UserRow>;
  onSubmit: (data: { username?: string; password?: string; role: string }) => void;
  onClose: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState({
    username: initial?.username ?? '',
    password: '',
    role: initial?.role ?? 'user',
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }}>
      {isNew && (
        <FormField label="Nombre de usuario" required>
          <input
            className="notion-input"
            value={form.username}
            onChange={e => set('username', e.target.value)}
            placeholder="ej: maria"
            required
            autoFocus
          />
        </FormField>
      )}
      <FormRow>
        <FormField label={isNew ? 'Contraseña' : 'Nueva contraseña'} required={isNew}>
          <input
            className="notion-input"
            type="password"
            value={form.password}
            onChange={e => set('password', e.target.value)}
            placeholder={isNew ? 'mínimo 6 caracteres' : 'dejar vacío para no cambiar'}
            required={isNew}
            minLength={isNew ? 6 : undefined}
          />
        </FormField>
        <FormField label="Rol">
          <select className="notion-input" value={form.role} onChange={e => set('role', e.target.value)}>
            <option value="user">Usuario</option>
            <option value="admin">Admin</option>
          </select>
        </FormField>
      </FormRow>
      <FormActions onClose={onClose} />
    </form>
  );
}

function ChangePasswordForm({ onSubmit, onClose }: {
  onSubmit: (data: { currentPassword: string; newPassword: string }) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (form.newPassword.length < 6) {
      setError('Mínimo 6 caracteres');
      return;
    }
    onSubmit({ currentPassword: form.currentPassword, newPassword: form.newPassword });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormField label="Contraseña actual" required>
        <input className="notion-input" type="password" value={form.currentPassword} onChange={e => set('currentPassword', e.target.value)} required autoFocus />
      </FormField>
      <FormField label="Nueva contraseña" required>
        <input className="notion-input" type="password" value={form.newPassword} onChange={e => set('newPassword', e.target.value)} required minLength={6} placeholder="mínimo 6 caracteres" />
      </FormField>
      <FormField label="Confirmar contraseña" required>
        <input className="notion-input" type="password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required />
      </FormField>
      {error && (
        <div style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid rgba(220,38,38,0.15)', borderRadius: 4, fontSize: 13, color: '#dc2626', marginBottom: 12 }}>
          {error}
        </div>
      )}
      <FormActions onClose={onClose} submitLabel="Cambiar contraseña" />
    </form>
  );
}

export default function Usuarios() {
  const { data: session } = useSession();
  // @ts-expect-error extra field
  const isAdmin = session?.user?.role === 'admin';
  // @ts-expect-error extra field
  const currentUserId = session?.user?.id;
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [userList, setUserList] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | 'password' | null>(null);
  const [editing, setEditing] = useState<UserRow | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const load = useCallback(async () => {
    if (!isAdmin) return;
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) setUserList(await res.json());
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: { username?: string; password?: string; role: string }) => {
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { setModal(null); load(); showToast('Usuario creado'); }
    else { const e = await res.json(); showToast(e.error); }
  };

  const handleEdit = async (data: { username?: string; password?: string; role: string }) => {
    if (!editing) return;
    const payload: Record<string, string> = { id: editing.id, role: data.role };
    if (data.password) payload.password = data.password;
    const res = await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (res.ok) { setModal(null); setEditing(null); load(); showToast('Usuario actualizado'); }
    else { const e = await res.json(); showToast(e.error); }
  };

  const handleDelete = async (u: UserRow) => {
    if (!confirm(`¿Eliminar al usuario "${u.username}"?`)) return;
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id }),
    });
    if (res.ok) { load(); showToast('Usuario eliminado'); }
    else { const e = await res.json(); showToast(e.error); }
  };

  const handleChangePassword = async (data: { currentPassword: string; newPassword: string }) => {
    const res = await fetch('/api/admin/users/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) { setModal(null); showToast('Contraseña actualizada'); }
    else { const e = await res.json(); showToast(e.error); }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <PageHeader
        title="Usuarios"
        count={isAdmin ? userList.length : undefined}
        actions={
          <div style={{ display: 'flex', gap: 8, flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : undefined }}>
            <button
              className="btn-secondary"
              onClick={() => setModal('password')}
              style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
            >
              <KeyRound size={14} />
              Cambiar mi contraseña
            </button>
            {isAdmin && (
              <button
                className="btn-primary"
                onClick={() => setModal('create')}
                style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
              >
                <Plus size={14} />
                Nuevo usuario
              </button>
            )}
          </div>
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
        {!isAdmin ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--app-text-muted)', fontSize: 14 }}>
            <Shield size={32} style={{ margin: '0 auto 12px', opacity: 0.4, display: 'block' }} />
            Solo los administradores pueden ver la lista de usuarios.
          </div>
        ) : loading ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--app-text-subtle)', fontSize: 14 }}>Cargando...</div>
        ) : (
          <div className="notion-card" style={{ overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--app-border)' }}>
                  {['Usuario', 'Rol', 'Creado', ''].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left', fontSize: 12,
                      fontWeight: 600, color: 'var(--app-text-muted)', letterSpacing: '0.05px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {userList.map(u => {
                  const badge = roleBadge(u.role);
                  const isMe = u.id === currentUserId;
                  return (
                    <tr
                      key={u.id}
                      style={{
                        borderBottom: '1px solid var(--app-border)',
                        background: isMe ? 'rgba(0,117,222,0.03)' : undefined,
                      }}
                    >
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: isMe ? 'var(--app-accent)' : 'var(--app-surface-hover)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <User size={14} color={isMe ? 'var(--app-accent-fg)' : 'var(--app-text-muted)'} />
                          </div>
                          <div>
                            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--app-text)' }}>
                              {u.username}
                            </span>
                            {isMe && (
                              <span style={{ fontSize: 11, color: '#0075de', marginLeft: 6 }}>(tú)</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <Badge label={badge.label} text={badge.text} bg={badge.bg} />
                      </td>
                      <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--app-text-muted)' }}>
                        {new Date(u.createdAt).toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => { setEditing(u); setModal('edit'); }}
                            style={{ padding: '5px 8px', border: '1px solid var(--app-border)', borderRadius: 4, background: 'var(--app-surface)', cursor: 'pointer', color: 'var(--app-text-muted)', display: 'flex', alignItems: 'center' }}
                          >
                            <Pencil size={13} />
                          </button>
                          {!isMe && (
                            <button
                              onClick={() => handleDelete(u)}
                              style={{ padding: '5px 8px', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 4, background: 'var(--app-surface)', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' }}
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {modal === 'create' && (
        <Modal title="Nuevo usuario" onClose={() => setModal(null)}>
          <UserForm isNew onSubmit={handleCreate} onClose={() => setModal(null)} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title={`Editar: ${editing.username}`} onClose={() => { setModal(null); setEditing(null); }}>
          <UserForm isNew={false} initial={editing} onSubmit={handleEdit} onClose={() => { setModal(null); setEditing(null); }} />
        </Modal>
      )}
      {modal === 'password' && (
        <Modal title="Cambiar contraseña" onClose={() => setModal(null)}>
          <ChangePasswordForm onSubmit={handleChangePassword} onClose={() => setModal(null)} />
        </Modal>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.85)', color: 'white', padding: '8px 16px',
          borderRadius: 6, fontSize: 13, zIndex: 100, whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
