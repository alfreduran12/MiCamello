import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Editor } from '@tiptap/core';

/**
 * Inserta una toolbar flotante ENCIMA de cada tabla activa usando
 * una ProseMirror Decoration widget — sin positioning absoluto.
 * Aparece en el flujo del documento justo sobre la tabla que tiene el cursor.
 */
export const TableToolbarExtension = Extension.create({
  name: 'tableToolbar',

  addProseMirrorPlugins() {
    const editor: Editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('tableToolbar'),

        props: {
          decorations(state) {
            const { selection } = state;
            const decorations: Decoration[] = [];

            state.doc.descendants((node, pos) => {
              if (node.type.name !== 'table') return;
              // Solo la tabla que contiene el cursor
              if (selection.from <= pos || selection.from >= pos + node.nodeSize) return;

              const widget = Decoration.widget(
                pos,
                () => {
                  const wrap = document.createElement('div');
                  wrap.className = 'notion-table-toolbar-widget';
                  Object.assign(wrap.style, {
                    display: 'flex',
                    gap: '4px',
                    padding: '4px 0 6px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  });

                  const BUTTONS = [
                    { label: '+ Col →', cmd: () => editor.chain().focus().addColumnAfter().run() },
                    { label: '+ Fila ↓', cmd: () => editor.chain().focus().addRowAfter().run() },
                    { label: '− Col',    cmd: () => editor.chain().focus().deleteColumn().run() },
                    { label: '− Fila',   cmd: () => editor.chain().focus().deleteRow().run() },
                  ];
                  const DANGER = { label: '✕ Tabla', cmd: () => editor.chain().focus().deleteTable().run() };

                  const makeBtn = (label: string, cmd: () => void, danger = false) => {
                    const btn = document.createElement('button');
                    btn.textContent = label;
                    btn.type = 'button';
                    Object.assign(btn.style, {
                      padding: '3px 9px',
                      border: '1px solid var(--app-border)',
                      borderRadius: '5px',
                      background: 'var(--app-surface)',
                      color: danger ? '#dc2626' : 'var(--app-text-muted)',
                      fontSize: '11.5px',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'background 0.1s',
                      lineHeight: '1.4',
                    });
                    btn.addEventListener('mouseenter', () => {
                      btn.style.background = 'var(--app-surface-hover)';
                    });
                    btn.addEventListener('mouseleave', () => {
                      btn.style.background = 'var(--app-surface)';
                    });
                    btn.addEventListener('mousedown', (e) => {
                      e.preventDefault();
                      cmd();
                    });
                    return btn;
                  };

                  BUTTONS.forEach(b => wrap.appendChild(makeBtn(b.label, b.cmd)));

                  // Separador visual
                  const sep = document.createElement('div');
                  Object.assign(sep.style, {
                    width: '1px', height: '16px',
                    background: 'var(--app-border)',
                    margin: '0 2px', alignSelf: 'center',
                  });
                  wrap.appendChild(sep);

                  wrap.appendChild(makeBtn(DANGER.label, DANGER.cmd, true));
                  return wrap;
                },
                { side: -1 }, // renderiza ANTES del nodo tabla
              );

              decorations.push(widget);
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
