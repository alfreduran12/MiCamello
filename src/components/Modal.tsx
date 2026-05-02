'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ title, onClose, children }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '18px 22px 14px',
            borderBottom: '1px solid var(--app-border)',
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.2px' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '4px', borderRadius: 4, display: 'flex', alignItems: 'center' }}
          >
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: '20px 24px 24px' }}>{children}</div>
      </div>
    </div>
  );
}
