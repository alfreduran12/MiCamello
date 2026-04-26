'use client';

import { useState } from 'react';
import { useApp } from '@/lib/context';
import { contractStatusBadge } from '@/lib/badges';
import { formatDate, formatCurrency } from '@/lib/storage';
import type { Contract, ContractStatus } from '@/lib/types';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';
import SearchBar from '@/components/SearchBar';
import PageHeader from '@/components/PageHeader';
import FormField, { FormRow, FormActions } from '@/components/FormField';
import { Plus, Pencil, Trash2, ExternalLink, DollarSign } from 'lucide-react';

const STATUS_OPTIONS: ContractStatus[] = ['activo', 'pendiente', 'completado', 'cancelado'];
const CURRENCIES = ['USD', 'EUR', 'MXN', 'COP', 'ARS', 'CLP', 'PEN', 'BRL'];

function ContractForm({ initial, onSubmit, onClose }: {
  initial?: Partial<Contract>;
  onSubmit: (data: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    clientName: initial?.clientName ?? '',
    title: initial?.title ?? '',
    value: initial?.value ?? 0,
    currency: initial?.currency ?? 'USD',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    status: initial?.status ?? 'pendiente' as ContractStatus,
    pdfUrl: initial?.pdfUrl ?? '',
    notes: initial?.notes ?? '',
  });

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ ...form, value: Number(form.value) }); }}>
      <FormRow>
        <FormField label="Cliente" required>
          <input className="notion-input" value={form.clientName} onChange={e => set('clientName', e.target.value)} required placeholder="Nombre del cliente" />
        </FormField>
        <FormField label="Estado">
          <select className="notion-input" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{contractStatusBadge[s].label}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormField label="Título del contrato">
        <input className="notion-input" value={form.title} onChange={e => set('title', e.target.value)} placeholder="Ej: Desarrollo de plataforma web" />
      </FormField>
      <FormRow>
        <FormField label="Valor">
          <input type="number" className="notion-input" value={form.value} onChange={e => set('value', e.target.value)} min={0} step={0.01} placeholder="0.00" />
        </FormField>
        <FormField label="Moneda">
          <select className="notion-input" value={form.currency} onChange={e => set('currency', e.target.value)}>
            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </FormField>
      </FormRow>
      <FormRow>
        <FormField label="Fecha inicio">
          <input type="date" className="notion-input" value={form.startDate} onChange={e => set('startDate', e.target.value)} />
        </FormField>
        <FormField label="Fecha fin">
          <input type="date" className="notion-input" value={form.endDate} onChange={e => set('endDate', e.target.value)} />
        </FormField>
      </FormRow>
      <FormField label="Enlace al PDF">
        <input className="notion-input" value={form.pdfUrl} onChange={e => set('pdfUrl', e.target.value)} placeholder="https://..." />
      </FormField>
      <FormField label="Notas">
        <textarea className="notion-input" value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} placeholder="Notas adicionales" style={{ resize: 'vertical' }} />
      </FormField>
      <FormActions onClose={onClose} />
    </form>
  );
}

export default function Contratos() {
  const { data, addContract, updateContract, deleteContract } = useApp();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Contract | null>(null);

  const filtered = data.contracts.filter(c =>
    c.clientName.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalValue = filtered
    .filter(c => c.status === 'activo')
    .reduce((sum, c) => sum + c.value, 0);

  const openEdit = (c: Contract) => { setEditing(c); setModal('edit'); };
  const closeModal = () => { setModal(null); setEditing(null); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <PageHeader
        title="Contratos"
        description={`${data.contracts.length} contratos · $${totalValue.toLocaleString('es-ES')} activo`}
        actions={
          <>
            <SearchBar value={search} onChange={setSearch} placeholder="Buscar contrato..." />
            <button className="btn-primary" onClick={() => setModal('create')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Nuevo contrato
            </button>
          </>
        }
      />

      <div className="page-padding" style={{ flex: 1, overflow: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#a39e98' }}>
            <p style={{ fontSize: 15 }}>No hay contratos{search ? ' que coincidan' : '. Crea el primero'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(contract => {
              const s = contractStatusBadge[contract.status];
              return (
                <div
                  key={contract.id}
                  className="notion-card"
                  style={{ padding: '16px 20px' }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'rgba(0,0,0,0.95)' }}>
                          {contract.clientName}
                        </h3>
                        <Badge label={s.label} bg={s.bg} text={s.text} size="sm" />
                      </div>
                      {contract.title && (
                        <p style={{ fontSize: 13, color: '#615d59', marginBottom: 8 }}>{contract.title}</p>
                      )}
                      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 16, fontWeight: 700, color: 'rgba(0,0,0,0.9)', letterSpacing: '-0.3px' }}>
                          <DollarSign size={14} style={{ color: '#1aae39' }} />
                          {contract.value.toLocaleString('es-ES')} {contract.currency}
                        </span>
                        {contract.startDate && (
                          <span style={{ fontSize: 12, color: '#a39e98' }}>
                            {formatDate(contract.startDate)} → {contract.endDate ? formatDate(contract.endDate) : 'indefinido'}
                          </span>
                        )}
                        {contract.notes && (
                          <span style={{ fontSize: 12, color: '#615d59' }}>{contract.notes}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
                      {contract.pdfUrl && (
                        <a href={contract.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ padding: '5px 8px', display: 'flex', color: '#0075de' }}>
                          <ExternalLink size={14} />
                        </a>
                      )}
                      <button className="btn-ghost" onClick={() => openEdit(contract)} style={{ padding: '5px 8px' }}><Pencil size={14} /></button>
                      <button className="btn-ghost" onClick={() => deleteContract(contract.id)} style={{ padding: '5px 8px', color: '#dc2626' }}><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal === 'create' && (
        <Modal title="Nuevo contrato" onClose={closeModal}>
          <ContractForm onSubmit={d => { addContract(d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
      {modal === 'edit' && editing && (
        <Modal title="Editar contrato" onClose={closeModal}>
          <ContractForm initial={editing} onSubmit={d => { updateContract(editing.id, d); closeModal(); }} onClose={closeModal} />
        </Modal>
      )}
    </div>
  );
}
