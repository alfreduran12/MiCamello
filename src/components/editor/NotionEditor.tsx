'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { DeletableImage } from './ImageNode';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import Typography from '@tiptap/extension-typography';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { SlashCommandExtension } from './SlashCommand';
import { TableToolbarExtension } from './TableToolbar';
import { FileAttachmentNode } from './FileAttachmentNode';
import { useEffect, useRef, useCallback } from 'react';
import 'tippy.js/dist/tippy.css';

interface NotionEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

/** Lee un File y devuelve su data URL (base64) */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const IMAGE_TYPES = /^image\/(png|jpe?g|gif|webp|svg\+xml|bmp|tiff?)$/i;

export default function NotionEditor({ content, onChange, placeholder }: NotionEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Placeholder.configure({
        placeholder: ({ node, editor }) => {
          if (node.type.name === 'heading') return 'Título...';
          // Solo mostrar en el primer párrafo cuando el doc está vacío
          if (editor.state.doc.childCount === 1) {
            return placeholder ?? "Escribe algo, o usa '/' para comandos...";
          }
          return '';
        },
        showOnlyCurrent: false,
      }),
      DeletableImage.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'editor-link' } }),
      Underline,
      Typography,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      SlashCommandExtension,
      TableToolbarExtension,
      FileAttachmentNode,
    ],
    content: (() => {
      try {
        const parsed = JSON.parse(content);
        return parsed && typeof parsed === 'object' ? parsed : undefined;
      } catch {
        return content || undefined;
      }
    })(),
    editorProps: {
      attributes: { class: 'notion-editor-content', spellcheck: 'true' },

      // ── Drag & drop ────────────────────────────────────────────────────
      handleDrop(view, event) {
        const files = event.dataTransfer?.files;
        if (!files?.length) return false;
        const file = files[0];
        if (!IMAGE_TYPES.test(file.type)) return false;
        event.preventDefault();
        readAsDataURL(file).then((src) => {
          const { schema } = view.state;
          const node = schema.nodes.image.create({ src, alt: file.name });
          view.dispatch(view.state.tr.replaceSelectionWith(node));
        });
        return true;
      },

      // ── Paste ──────────────────────────────────────────────────────────
      handlePaste(view, event) {
        const items = event.clipboardData?.items;
        if (!items) return false;
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;
            readAsDataURL(file).then((src) => {
              view.dispatch(
                view.state.tr.replaceSelectionWith(
                  view.state.schema.nodes.image.create({ src })
                )
              );
            });
            return true;
          }
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      onChange(JSON.stringify(editor.getJSON()));
    },
  });

  // Sync when switching notes
  useEffect(() => {
    if (!editor) return;
    const current = JSON.stringify(editor.getJSON());
    if (current !== content && content) {
      try {
        editor.commands.setContent(JSON.parse(content));
      } catch {
        editor.commands.setContent(content);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content]);

  // ── File/image picker ────────────────────────────────────────────────
  const handleFilePick = useCallback(async (file: File) => {
    if (!editor) return;

    if (IMAGE_TYPES.test(file.type)) {
      // Imagen → base64 directa, preview inmediato
      const src = await readAsDataURL(file);
      editor.chain().focus().setImage({ src, alt: file.name }).run();
    } else {
      // Documento → subir al servidor e insertar nodo fileAttachment
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        editor.chain().focus()
          .insertContent({
            type: 'fileAttachment',
            attrs: { src: data.url, name: data.name, size: data.size },
          })
          .run();
      }
    }
  }, [editor]);

  if (!editor) return null;

  const fmtBtn = (
    label: string,
    isActive: boolean,
    action: () => void,
    title: string,
    style?: React.CSSProperties
  ) => (
    <button
      key={label}
      onMouseDown={(e) => { e.preventDefault(); action(); }}
      title={title}
      style={{
        padding: '3px 8px', border: 'none', borderRadius: 4,
        background: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
        color: isActive ? 'white' : 'rgba(255,255,255,0.75)',
        cursor: 'pointer', fontSize: 13, minWidth: 28,
        ...style,
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* Bubble menu */}
      <BubbleMenu editor={editor}>
        <div style={{
          display: 'flex', gap: 2,
          background: 'rgba(15,15,15,0.95)',
          borderRadius: 8, padding: '4px 6px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
        }}>
          {fmtBtn('B', editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), 'Negrita', { fontWeight: 700 })}
          {fmtBtn('I', editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), 'Cursiva', { fontStyle: 'italic' })}
          {fmtBtn('U', editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), 'Subrayado', { textDecoration: 'underline' })}
          {fmtBtn('S', editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), 'Tachado', { textDecoration: 'line-through' })}
          {fmtBtn('<>', editor.isActive('code'), () => editor.chain().focus().toggleCode().run(), 'Código')}
          <div style={{ width: 1, background: 'rgba(255,255,255,0.15)', margin: '2px 2px' }} />
          {fmtBtn('🔗', editor.isActive('link'), () => {
            const url = window.prompt('URL del enlace:');
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }, 'Enlace', { fontSize: 12 })}
        </div>
      </BubbleMenu>

      {/* ── Toolbar: Adjuntar + hint ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.txt"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFilePick(file);
            e.target.value = '';
          }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Adjuntar archivo o imagen"
          style={{
            padding: '5px 12px', border: '1px solid var(--app-border)',
            borderRadius: 6, background: 'var(--app-surface)', color: 'var(--app-text-muted)',
            fontSize: 12, cursor: 'pointer', display: 'flex',
            alignItems: 'center', gap: 5,
          }}
        >
          📎 Adjuntar
        </button>
        <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>
          Escribe <kbd style={{ background: 'var(--app-surface-hover)', border: '1px solid var(--app-border)', borderRadius: 3, padding: '1px 4px', fontSize: 10 }}>/</kbd> para comandos · Arrastra imágenes aquí
        </span>
      </div>

      {/* Table toolbar is rendered inline via TableToolbarExtension (ProseMirror decoration) */}
      <EditorContent editor={editor} />
    </div>
  );
}
