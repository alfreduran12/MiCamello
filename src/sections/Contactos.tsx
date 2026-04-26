'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import type { Contact } from '@/lib/types';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2, Mail, Phone, Building2, Tag, User } from 'lucide-react';

function ContactForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Contact>;
  onSubmit: (data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    company: initial?.company ?? '',
    role: initial?.role ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    tags: initial?.tags?.join(', ') ?? '',
    notes: initial?.notes ?? '',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => {
      e.preventDefault();
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      onSubmit({ ...form, tags });
    }}>
      <FormRow>
        <FormField label="Nombre" required>
          <input className="notion-input" value={form.name} onChange={e => set('name', e.target.value)} required placeholder="Nombre completo" />
        </FormField>
        <FormField label="Empresa">
          <input className="notion-input" value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nombre de la empresa" />
        </FormField>
      </FormRow>
      <FormField label="Rol / Cargo">
        <input className="notion-input" value={form.role} onChange={e => set('role', e.target.value)} placeholder="CEO, CTO, Desarrollador..." />
      </FormField>
      <FormRow>
        <FormField label="Email">
          <input type="email" className="notion-input" value={form.email} onChange={e => set('email', e.target.value)} placeholder="correo@empresa.com" />
        </FormField>
        <FormField label="Teléfono">
          <input className="notion-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 0100" />
        </FormField>
      </FormRow>
      <FormField label="Tags" hint="Separa con comas: cliente, tech, socio">
        <input className="notion-input" value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="cliente, tech, aliado..." />
      </FormField>
      <FormField label="Notas">
        <textarea className="notion-input" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Información adicional" style={{ resize: 'vertical' }} />
      </FormField>
      <FormActions onClose={onClose} />
    </form>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const colors = ['#0075de', '#2a9d99', '#1aae39', '#dd5b00', '#391c57', '#615d59'];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', background: color + '20', border: `1.5px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      fontSize: 13, fontWeight: 700, color,
    }}>
      {initials}
    </div>
  );
}

export default function Contactos() {
  const { data, addContact, updateContact, deleteContact } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Contact | null>(null);

  const filtered = data.contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  const openEdit = (c: Contact) => { setEditing(c); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Contactos"
        description={`${data.contacts.length} contactos en el directorio`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar contacto..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nuevo contacto
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a39e98' }}>
            <p style={{ fontSize: 15 }}>No hay contactos{search ? ' que coincidan' : '. Agrega el primero'}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 10 }}>
            {filtered.map(contact => (
              <div key={contact.id} className="notion-card" style={{ padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <Avatar name={contact.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'rgba(0,0,0,0.95)' }}>{contact.name}</div>
                        {contact.role && (
                          <div style={{ fontSize: 12, color: '#615d59', marginTop: 1 }}>{contact.role}</div>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        <button className="btn-ghost" onClick={() => openEdit(contact)} style={{ padding: '2px 5px' }}><Pencil size={12} /></button>
                        <button className="btn-ghost" onClick={() => deleteContact(contact.id)} style={{ padding: '2px 5px', color: '#dc2626' }}><Trash2 size={12} /></button>
                      </div>
                    </div>

                    {contact.company && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                        <Building2 size={11} style={{ color: '#a39e98' }} />
                        <span style={{ fontSize: 12, color: '#615d59' }}>{contact.company}</span>
                      </div>
                    )}

                    {contact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <Mail size={11} style={{ color: '#a39e98' }} />
                        <a href={`mailto:${contact.email}`} style={{ fontSize: 12, color: '#0075de', textDecoration: 'none' }}>
                          {contact.email}
                        </a>
                      </div>
                    )}

                    {contact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 3 }}>
                        <Phone size={11} style={{ color: '#a39e98' }} />
                        <span style={{ fontSize: 12, color: '#615d59' }}>{contact.phone}</span>
                      </div>
                    )}

                    {contact.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 8 }}>
                        {contact.tags.map(tag => (
                          <span
                            key={tag}
                            style={{ fontSize: 11, color: '#615d59', background: '#f6f5f4', padding: '1px 6px', borderRadius: 9999, fontWeight: 500 }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {contact.notes && (
                      <p style={{ fontSize: 11, color: '#a39e98', marginTop: 6, lineHeight: 1.4 }}>{contact.notes}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Nuevo contacto" onClose={closeModal}>
          <ContactForm onSubmit={d => { addContact(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar contacto" onClose={closeModal}>
          <ContactForm initial={editing} onSubmit={d => { updateContact(editing.id, d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
