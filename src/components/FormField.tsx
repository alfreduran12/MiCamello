'use client';

import React from 'react';

interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}

export default function FormField({ label, required, children, hint }: FormFieldProps) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--app-text-muted)',
          marginBottom: 6,
          letterSpacing: '0.1px',
        }}
      >
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 12, color: 'var(--app-text-subtle)', marginTop: 4 }}>{hint}</p>}
    </div>
  );
}

export function FormRow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {children}
    </div>
  );
}

export function FormActions({ onClose, submitLabel = 'Guardar' }: { onClose: () => void; submitLabel?: string }) {
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--app-border)' }}>
      <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
      <button type="submit" className="btn-primary">{submitLabel}</button>
    </div>
  );
}
