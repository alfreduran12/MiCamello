'use client';

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import type { Editor, Range } from '@tiptap/core';

export interface SlashMenuItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashMenuProps {
  items: SlashMenuItem[];
  command: (item: SlashMenuItem) => void;
}

export interface SlashMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SlashMenu = forwardRef<SlashMenuRef, SlashMenuProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => setSelectedIndex(0), [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown({ event }: { event: KeyboardEvent }) {
      if (event.key === 'ArrowUp') {
        setSelectedIndex((i) => (i - 1 + items.length) % items.length);
        return true;
      }
      if (event.key === 'ArrowDown') {
        setSelectedIndex((i) => (i + 1) % items.length);
        return true;
      }
      if (event.key === 'Enter') {
        const item = items[selectedIndex];
        if (item) command(item);
        return true;
      }
      return false;
    },
  }));

  if (!items.length) return null;

  return (
    <div style={{
      background: 'var(--app-surface)',
      border: '1px solid var(--app-border)',
      borderRadius: 8,
      overflow: 'hidden',
      width: 280,
      maxHeight: 320,
      overflowY: 'auto',
    }}>
      <div style={{ padding: '4px' }}>
        {items.map((item, index) => (
          <button
            key={item.title}
            onClick={() => command(item)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              width: '100%',
              padding: '8px 10px',
              border: 'none',
              borderRadius: 6,
              background: index === selectedIndex ? 'var(--app-surface-hover)' : 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'background 0.1s',
            }}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div style={{
              width: 32,
              height: 32,
              borderRadius: 6,
              background: index === selectedIndex ? 'var(--app-accent)' : 'var(--app-surface-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 13,
              fontWeight: 700,
              color: index === selectedIndex ? 'var(--app-accent-fg)' : 'var(--app-text-muted)',
              flexShrink: 0,
              fontFamily: 'monospace',
            }}>
              {item.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--app-text)' }}>
                {item.title}
              </div>
              <div style={{ fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 1 }}>
                {item.description}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});

SlashMenu.displayName = 'SlashMenu';

export default SlashMenu;
