'use client';

import { useState, useEffect } from 'react';
import { X, FileText, FileSpreadsheet, File, ChevronDown, ChevronUp } from 'lucide-react';

interface FilePreviewProps {
  url: string;
  name: string;
  type: string;
  onRemove?: () => void;
}

function parseCSV(text: string): string[][] {
  return text.split('\n').filter(r => r.trim()).map(row => {
    const cells: string[] = [];
    let cur = '', inQ = false;
    for (const ch of row) {
      if (ch === '"') { inQ = !inQ; continue; }
      if (ch === ',' && !inQ) { cells.push(cur); cur = ''; continue; }
      cur += ch;
    }
    cells.push(cur);
    return cells;
  });
}

function FileIcon({ ext }: { ext: string }) {
  if (ext === 'pdf') return <File size={14} style={{ color: '#e53e3e' }} />;
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet size={14} style={{ color: '#38a169' }} />;
  return <FileText size={14} style={{ color: '#3182ce' }} />;
}

export default function FilePreview({ url, name, type, onRemove }: FilePreviewProps) {
  const [expanded, setExpanded] = useState(true);
  const [csvData, setCsvData] = useState<string[][] | null>(null);
  const [xlsxData, setXlsxData] = useState<string[][] | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const isPdf = ext === 'pdf' || type === 'application/pdf';
  const isCsv = ext === 'csv' || type === 'text/csv';
  const isXlsx = ['xlsx', 'xls'].includes(ext);
  const isDocx = ['docx', 'doc'].includes(ext);

  useEffect(() => {
    if (isCsv) {
      fetch(url)
        .then(r => r.text())
        .then(text => setCsvData(parseCSV(text)))
        .catch(() => setError('No se pudo leer el CSV'));
    }

    if (isXlsx) {
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(async buf => {
          const XLSX = await import('xlsx');
          const wb = XLSX.read(buf, { type: 'array' });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 }) as string[][];
          setXlsxData(rows.filter(r => r.length > 0));
        })
        .catch(() => setError('No se pudo leer el archivo Excel'));
    }

    if (isDocx) {
      fetch(url)
        .then(r => r.arrayBuffer())
        .then(async buf => {
          const mammoth = await import('mammoth');
          const result = await mammoth.convertToHtml({ arrayBuffer: buf });
          setDocxHtml(result.value);
        })
        .catch(() => setError('No se pudo leer el archivo Word'));
    }
  }, [url, isCsv, isXlsx, isDocx]);

  const tableData = csvData ?? xlsxData;

  return (
    <div style={{
      border: '1px solid var(--app-border)',
      borderRadius: 8,
      overflow: 'hidden',
      marginBottom: 12,
      background: 'var(--app-surface)',
    }}>
      {/* Header del archivo */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 12px',
        background: 'var(--app-bg)',
        borderBottom: expanded ? '1px solid var(--app-border)' : 'none',
        cursor: 'pointer',
      }} onClick={() => setExpanded(v => !v)}>
        <FileIcon ext={ext} />
        <span style={{
          flex: 1, fontSize: 12, fontWeight: 500,
          color: 'var(--app-text)', overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          {expanded ? <ChevronUp size={13} style={{ color: 'var(--app-text-subtle)' }} /> : <ChevronDown size={13} style={{ color: 'var(--app-text-subtle)' }} />}
          {onRemove && (
            <button
              onClick={e => { e.stopPropagation(); onRemove(); }}
              style={{ padding: 2, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--app-text-subtle)', display: 'flex', borderRadius: 4 }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Previsualización */}
      {expanded && (
        <div style={{ maxHeight: 420, overflow: 'auto' }}>
          {error && (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--app-text-subtle)', textAlign: 'center' }}>{error}</div>
          )}

          {/* PDF */}
          {isPdf && !error && (
            <iframe
              src={url}
              style={{ width: '100%', height: 400, border: 'none', display: 'block' }}
              title={name}
            />
          )}

          {/* CSV / Excel — tabla */}
          {tableData && !error && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr>
                    {(tableData[0] ?? []).map((cell, i) => (
                      <th key={i} style={{
                        padding: '6px 10px', textAlign: 'left',
                        background: 'var(--app-bg)',
                        borderBottom: '1px solid var(--app-border)',
                        fontWeight: 600, color: 'var(--app-text-muted)',
                        whiteSpace: 'nowrap',
                        position: 'sticky', top: 0, zIndex: 1,
                      }}>
                        {String(cell ?? '')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tableData.slice(1).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((cell, ci) => (
                        <td key={ci} style={{
                          padding: '5px 10px',
                          borderBottom: '1px solid var(--app-border)',
                          color: 'var(--app-text)',
                          whiteSpace: 'nowrap',
                        }}>
                          {String(cell ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Word */}
          {docxHtml && !error && (
            <div
              style={{ padding: '16px 20px', fontSize: 13, color: 'var(--app-text)', lineHeight: 1.6 }}
              dangerouslySetInnerHTML={{ __html: docxHtml }}
            />
          )}

          {/* Tipo no soportado pero con previsualización de texto */}
          {!isPdf && !tableData && !docxHtml && !error && !isDocx && !isXlsx && !isCsv && (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--app-text-subtle)', textAlign: 'center' }}>
              Vista previa no disponible —{' '}
              <a href={url} download={name} style={{ color: 'var(--app-accent)' }}>Descargar</a>
            </div>
          )}

          {/* Loading state para docx/xlsx */}
          {(isDocx && !docxHtml && !error) || (isXlsx && !xlsxData && !error) ? (
            <div style={{ padding: 16, fontSize: 12, color: 'var(--app-text-subtle)', textAlign: 'center' }}>
              Cargando vista previa…
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
