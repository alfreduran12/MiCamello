'use client';

import { Node } from '@tiptap/core';
import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

/* ── helpers ──────────────────────────────────────────────────────────────── */

const EXT_META: Record<string, { label: string; color: string; bg: string }> = {
  pdf:  { label: 'PDF',  color: '#dc2626', bg: 'rgba(220,38,38,0.12)' },
  docx: { label: 'DOC',  color: '#2563eb', bg: 'rgba(37,99,235,0.12)'  },
  doc:  { label: 'DOC',  color: '#2563eb', bg: 'rgba(37,99,235,0.12)'  },
  pptx: { label: 'PPT',  color: '#ea580c', bg: 'rgba(234,88,12,0.12)'  },
  ppt:  { label: 'PPT',  color: '#ea580c', bg: 'rgba(234,88,12,0.12)'  },
  xlsx: { label: 'XLS',  color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  xls:  { label: 'XLS',  color: '#16a34a', bg: 'rgba(22,163,74,0.12)'  },
  zip:  { label: 'ZIP',  color: '#9333ea', bg: 'rgba(147,51,234,0.12)' },
  txt:  { label: 'TXT',  color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

function getExt(name: string) {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

function fmtSize(bytes: number) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Extrae el filename de una URL tipo /uploads/foo.pdf o /api/files/foo.pdf */
function extractFilename(src: string) {
  return src.split('/').pop() ?? '';
}

/* ── React view ───────────────────────────────────────────────────────────── */

function FileAttachmentView({ node, deleteNode }: NodeViewProps) {
  const { src, name, size } = node.attrs as { src: string; name: string; size: number };
  const [preview, setPreview]   = useState(false);
  const [deleting, setDeleting] = useState(false);

  const ext  = getExt(name);
  const meta = EXT_META[ext] ?? { label: ext.toUpperCase() || '?', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };

  const isPDF      = ext === 'pdf';
  const isOffice   = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext);
  const canPreview = isPDF || isOffice;

  // src = /uploads/filename → rewrite lo redirige a /api/files/filename (autenticado)
  const absoluteSrc = typeof window !== 'undefined' ? window.location.origin + src : src;

  const previewUrl = isPDF
    ? src
    : isOffice
      ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteSrc)}`
      : null;

  const isLocalDev = typeof window !== 'undefined' && window.location.hostname === 'localhost';

  /* ── delete: borra del servidor y elimina el nodo del editor ── */
  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setDeleting(true);
    const filename = extractFilename(src);
    if (filename) {
      try {
        await fetch(`/api/files/${filename}`, { method: 'DELETE' });
      } catch {
        // si falla la red lo ignoramos — el nodo se elimina igual
      }
    }
    deleteNode();
  }

  return (
    <NodeViewWrapper
      style={{ display: 'block', margin: '8px 0', userSelect: 'none' }}
      contentEditable={false}
    >
      <div style={{
        border: `1px solid var(--app-border)`,
        borderRadius: 8,
        background: 'var(--app-surface)',
        overflow: 'hidden',
        transition: 'border-color 0.15s, opacity 0.15s',
        opacity: deleting ? 0.5 : 1,
      }}>

        {/* ── Header row ──────────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px' }}>

          {/* Badge */}
          <div style={{
            width: 38, height: 38, borderRadius: 7, flexShrink: 0,
            background: meta.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: meta.color, letterSpacing: '0.3px' }}>
              {meta.label}
            </span>
          </div>

          {/* Name + size */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 13, fontWeight: 600, color: 'var(--app-text)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {name}
            </div>
            {size > 0 && (
              <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 1 }}>
                {fmtSize(size)}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
            {canPreview && (
              <button
                onClick={() => setPreview(v => !v)}
                style={actionBtn}
              >
                {preview ? '✕ Cerrar' : '👁 Vista previa'}
              </button>
            )}
            <a
              href={src}
              download={name}
              style={{ ...actionBtn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' } as React.CSSProperties}
            >
              ↓ Descargar
            </a>
            <button
              onMouseDown={handleDelete}
              disabled={deleting}
              title="Eliminar archivo"
              style={{ ...actionBtn, color: '#dc2626', borderColor: 'rgba(220,38,38,0.25)' }}
            >
              🗑
            </button>
          </div>
        </div>

        {/* ── Preview pane ────────────────────────────────────────────── */}
        {preview && (
          <div style={{ borderTop: '1px solid var(--app-border)' }}>
            {isPDF && (
              <iframe
                src={src}
                title={name}
                style={{ width: '100%', height: 520, border: 'none', display: 'block' }}
              />
            )}

            {isOffice && isLocalDev && (
              <div style={{
                padding: '24px 20px', textAlign: 'center',
                color: 'var(--app-text-subtle)', fontSize: 13,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🏢</div>
                <p style={{ fontWeight: 600, color: 'var(--app-text-muted)', marginBottom: 4 }}>
                  Vista previa de Office no disponible en local
                </p>
                <p style={{ fontSize: 12 }}>
                  En producción se cargará vía Microsoft Office Online.
                  <br />Por ahora, usa el botón "Descargar" para abrir el archivo.
                </p>
              </div>
            )}

            {isOffice && !isLocalDev && previewUrl && (
              <iframe
                src={previewUrl}
                title={name}
                style={{ width: '100%', height: 520, border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
}

/* shared button style */
const actionBtn: React.CSSProperties = {
  padding: '4px 10px',
  border: '1px solid var(--app-border)',
  borderRadius: 5,
  background: 'var(--app-surface-hover)',
  color: 'var(--app-text-muted)',
  fontSize: 11,
  cursor: 'pointer',
  fontFamily: 'inherit',
  lineHeight: 1.5,
};

/* ── Tiptap Node definition ───────────────────────────────────────────────── */

export const FileAttachmentNode = Node.create({
  name: 'fileAttachment',
  group: 'block',
  atom: true,
  draggable: true,
  selectable: true,

  addAttributes() {
    return {
      src:  { default: '' },
      name: { default: '' },
      size: { default: 0 },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-file-attachment]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', { 'data-file-attachment': '', ...HTMLAttributes }];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileAttachmentView);
  },
});
