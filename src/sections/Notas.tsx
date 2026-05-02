'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Trash2, FileText, Search, Paperclip, Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import FilePreview from '@/components/FilePreview';

const NotionEditor = dynamic(() => import('@/components/editor/NotionEditor'), { ssr: false });

interface NoteAttachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

interface Note {
  id: string;
  title: string;
  content: string;
  emoji: string;
  attachments: string; // JSON serializado
  createdAt: string;
  updatedAt: string;
}

const EMOJIS = ['📝', '💡', '🎯', '📌', '🔖', '🧠', '📋', '✍️', '🗒️', '💬', '📊', '🚀', '⭐', '🔍', '🛠️'];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Ahora';
  if (mins < 60) return `Hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `Hace ${days}d`;
  return new Date(dateStr).toLocaleDateString('es', { day: 'numeric', month: 'short' });
}

function getPreview(content: string): string {
  try {
    const json = JSON.parse(content);
    const texts: string[] = [];
    const walk = (node: { type?: string; text?: string; content?: unknown[] }) => {
      if (node.type === 'text' && node.text) texts.push(node.text);
      if (node.content) (node.content as typeof node[]).forEach(walk);
    };
    walk(json);
    return texts.join(' ').slice(0, 120) || 'Sin contenido';
  } catch {
    return content.slice(0, 120) || 'Sin contenido';
  }
}

export default function Notas() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [active, setActive] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showList, setShowList] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeRef = useRef<Note | null>(null);
  activeRef.current = active;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notes');
      if (res.ok) {
        const data: Note[] = await res.json();
        setNotes(data);
        if (!activeRef.current && data.length > 0) {
          setActive(data[0]);
          if (isMobile) setShowList(false);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isMobile]);

  useEffect(() => { load(); }, [load]);

  const createNote = async () => {
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Sin título', content: '{}', emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] }),
    });
    if (res.ok) {
      const note: Note = await res.json();
      setNotes(prev => [note, ...prev]);
      setActive(note);
      if (isMobile) setShowList(false);
    }
  };

  const saveNote = useCallback(async (note: Note) => {
    setSaving(true);
    await fetch('/api/notes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: note.id, title: note.title, content: note.content, emoji: note.emoji }),
    });
    setNotes(prev => prev.map(n => n.id === note.id ? { ...n, ...note, updatedAt: new Date().toISOString() } : n));
    setSaving(false);
  }, []);

  const debounceSave = useCallback((note: Note) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => saveNote(note), 800);
  }, [saveNote]);

  const handleContentChange = (content: string) => {
    if (!active) return;
    const updated = { ...active, content };
    setActive(updated);
    debounceSave(updated);
  };

  const handleTitleChange = (title: string) => {
    if (!active) return;
    const updated = { ...active, title };
    setActive(updated);
    debounceSave(updated);
  };

  const handleEmojiChange = (emoji: string) => {
    if (!active) return;
    const updated = { ...active, emoji };
    setActive(updated);
    setShowEmojiPicker(false);
    saveNote(updated);
  };

  const getAttachments = (note: Note): NoteAttachment[] => {
    try { return JSON.parse(note.attachments || '[]'); } catch { return []; }
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !active) return;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'text/csv', 'application/csv'];
    const allowedExt = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'csv'];

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      if (!allowed.includes(file.type) && !allowedExt.includes(ext)) {
        alert(`Tipo de archivo no soportado: ${file.name}. Solo PDF, Word, Excel y CSV.`);
        continue;
      }
      setUploading(true);
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (!res.ok) { alert('Error al subir el archivo'); continue; }
        const data = await res.json();
        const newAttachment: NoteAttachment = { url: data.url, name: file.name, type: file.type || `application/${ext}`, size: file.size };
        const current = getAttachments(active);
        const updated = { ...active, attachments: JSON.stringify([...current, newAttachment]) };
        setActive(updated);
        setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
        await saveNote(updated);
      } finally {
        setUploading(false);
      }
    }
  };

  const removeAttachment = async (url: string) => {
    if (!active) return;
    const filtered = getAttachments(active).filter(a => a.url !== url);
    const updated = { ...active, attachments: JSON.stringify(filtered) };
    setActive(updated);
    setNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    await saveNote(updated);
  };

  const deleteNote = async (id: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;
    await fetch('/api/notes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    setNotes(prev => prev.filter(n => n.id !== id));
    if (active?.id === id) {
      const remaining = notes.filter(n => n.id !== id);
      setActive(remaining[0] ?? null);
      if (isMobile) setShowList(true);
    }
  };

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    getPreview(n.content).toLowerCase().includes(search.toLowerCase())
  );

  // ── Sidebar de notas ──────────────────────────────────────────────────────
  const NoteList = (
    <div style={{
      width: isMobile ? '100%' : 260,
      flexShrink: 0,
      borderRight: isMobile ? 'none' : '1px solid var(--app-border)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'var(--app-sidebar)',
    }}>
      {/* Header */}
      <div style={{ padding: '16px 14px 10px', borderBottom: '1px solid var(--app-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--app-text)', letterSpacing: '-0.1px' }}>
            Notas
            <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--app-text-subtle)', fontWeight: 400 }}>
              {notes.length}
            </span>
          </span>
          <button
            onClick={createNote}
            style={{
              width: 26, height: 26, border: 'none', borderRadius: 6,
              background: '#0075de', color: 'white', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Plus size={14} />
          </button>
        </div>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--app-text-subtle)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar notas..."
            style={{
              width: '100%', padding: '5px 8px 5px 26px', fontSize: 12,
              border: '1px solid var(--app-border)', borderRadius: 6,
              background: 'var(--app-surface)', color: 'var(--app-text)', outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 20, textAlign: 'center', color: 'var(--app-text-subtle)', fontSize: 12 }}>Cargando...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center' }}>
            <FileText size={28} style={{ color: 'var(--app-text-subtle)', margin: '0 auto 8px', display: 'block' }} />
            <div style={{ fontSize: 12, color: 'var(--app-text-subtle)' }}>
              {search ? 'No hay resultados' : 'No hay notas aún'}
            </div>
            {!search && (
              <button
                onClick={createNote}
                style={{ marginTop: 10, fontSize: 12, color: '#0075de', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Crear la primera nota
              </button>
            )}
          </div>
        ) : (
          filtered.map(note => {
            const isActive = note.id === active?.id;
            return (
              <div
                key={note.id}
                onClick={() => {
                  setActive(note);
                  if (isMobile) setShowList(false);
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: isActive ? 'var(--app-surface-hover)' : 'transparent',
                  borderLeft: isActive ? '2px solid #0075de' : '2px solid transparent',
                  transition: 'background 0.1s',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{note.emoji || '📝'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600,
                      color: isActive ? 'var(--app-accent)' : 'var(--app-text)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {note.title || 'Sin título'}
                    </div>
                    <div style={{
                      fontSize: 11, color: 'var(--app-text-subtle)', marginTop: 2,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {getPreview(note.content)}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--app-text-subtle)', marginTop: 4 }}>
                      {timeAgo(note.updatedAt)}
                    </div>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteNote(note.id); }}
                    style={{
                      padding: 4, border: 'none', background: 'none',
                      color: '#d3cec9', cursor: 'pointer', borderRadius: 4,
                      opacity: 0, transition: 'opacity 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
                    onFocus={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
                    onBlur={e => (e.currentTarget as HTMLElement).style.opacity = '0'}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  // ── Editor ────────────────────────────────────────────────────────────────
  const EditorPanel = active ? (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'var(--app-surface)' }}>
      {/* Editor header */}
      <div style={{
        padding: '20px 32px 0',
        borderBottom: '1px solid var(--app-border)',
        flexShrink: 0,
      }}>
        {/* Mobile back */}
        {isMobile && (
          <button
            onClick={() => setShowList(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              color: '#0075de', fontSize: 13, background: 'none',
              border: 'none', cursor: 'pointer', padding: '0 0 12px',
            }}
          >
            ← Notas
          </button>
        )}

        {/* Emoji + title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowEmojiPicker(v => !v)}
              title="Cambiar emoji"
              style={{
                fontSize: 32, border: 'none', background: 'none',
                cursor: 'pointer', padding: '0 4px',
                lineHeight: 1,
              }}
            >
              {active.emoji || '📝'}
            </button>
            {showEmojiPicker && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, zIndex: 100,
                background: 'var(--app-surface)', border: '1px solid var(--app-border)',
                borderRadius: 10, padding: 10,
                display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4, width: 'max-content',
              }}>
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleEmojiChange(e)}
                    style={{
                      fontSize: 20, border: 'none', background: 'none',
                      cursor: 'pointer', padding: '4px 6px', borderRadius: 6,
                    }}
                    onMouseEnter={el => (el.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)'}
                    onMouseLeave={el => (el.currentTarget as HTMLElement).style.background = 'none'}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <input
              value={active.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Sin título"
              style={{
                width: '100%', fontSize: 26, fontWeight: 700,
                border: 'none', outline: 'none', background: 'transparent',
                color: 'var(--app-text)', letterSpacing: '-0.5px',
                lineHeight: 1.3, fontFamily: 'Inter, sans-serif',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>
                Actualizada {timeAgo(active.updatedAt)}
              </span>
              {saving && <span style={{ fontSize: 11, color: 'var(--app-text-subtle)' }}>Guardando...</span>}
              {/* Botón adjuntar archivo */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.doc,.xlsx,.xls,.csv"
                multiple
                style={{ display: 'none' }}
                onChange={e => handleFileUpload(e.target.files)}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Adjuntar archivo (PDF, Word, Excel, CSV)"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '3px 8px', border: '1px solid var(--app-border)',
                  borderRadius: 5, background: 'var(--app-bg)',
                  color: uploading ? 'var(--app-text-subtle)' : 'var(--app-text-muted)',
                  fontSize: 11, cursor: uploading ? 'not-allowed' : 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => !uploading && ((e.currentTarget as HTMLElement).style.background = 'var(--app-surface-hover)')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = 'var(--app-bg)')}
              >
                {uploading
                  ? <><Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Subiendo…</>
                  : <><Paperclip size={11} /> Adjuntar</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Editor content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 120px' }}>
        {/* Archivos adjuntos */}
        {getAttachments(active).length > 0 && (
          <div style={{ marginBottom: 20 }}>
            {getAttachments(active).map(att => (
              <FilePreview
                key={att.url}
                url={att.url}
                name={att.name}
                type={att.type}
                onRemove={() => removeAttachment(att.url)}
              />
            ))}
          </div>
        )}
        <NotionEditor
          key={active.id}
          content={active.content}
          onChange={handleContentChange}
        />
      </div>
    </div>
  ) : (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--app-surface)', color: 'var(--app-text-subtle)', gap: 12,
    }}>
      <FileText size={40} style={{ opacity: 0.3 }} />
      <div style={{ fontSize: 14, fontWeight: 500 }}>Selecciona una nota o crea una nueva</div>
      <button
        onClick={createNote}
        style={{
          padding: '8px 18px', background: '#0075de', color: 'white',
          border: 'none', borderRadius: 6, fontSize: 13, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500,
        }}
      >
        <Plus size={14} /> Nueva nota
      </button>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
      {/* Mobile: show list or editor */}
      {isMobile ? (
        showList ? NoteList : EditorPanel
      ) : (
        <>
          {NoteList}
          {EditorPanel}
        </>
      )}
    </div>
  );
}
