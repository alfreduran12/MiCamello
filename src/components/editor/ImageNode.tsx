'use client';

import { NodeViewWrapper, ReactNodeViewRenderer } from '@tiptap/react';
import Image from '@tiptap/extension-image';
import type { NodeViewProps } from '@tiptap/react';
import { useState } from 'react';

function ImageView({ node, deleteNode, selected }: NodeViewProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <NodeViewWrapper
      style={{ display: 'block', position: 'relative', userSelect: 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={node.attrs.src}
        alt={node.attrs.alt || ''}
        style={{
          maxWidth: '100%',
          borderRadius: 8,
          margin: '8px 0',
          display: 'block',
          border: selected
            ? '2px solid var(--app-accent)'
            : '1px solid var(--app-border)',
          transition: 'border-color 0.15s',
          cursor: 'default',
        }}
      />

      {/* Botón eliminar — visible al hacer hover */}
      {(hovered || selected) && (
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            deleteNode();
          }}
          title="Eliminar imagen"
          style={{
            position: 'absolute',
            top: 12,
            right: 8,
            width: 26,
            height: 26,
            borderRadius: 6,
            border: 'none',
            background: 'rgba(0,0,0,0.65)',
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            lineHeight: 1,
            backdropFilter: 'blur(4px)',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(220,38,38,0.85)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.65)'}
        >
          ✕
        </button>
      )}
    </NodeViewWrapper>
  );
}

/** Extiende la extensión Image oficial con un NodeView que añade el botón de borrar */
export const DeletableImage = Image.extend({
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});
