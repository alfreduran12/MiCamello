import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { readFile, unlink } from 'fs/promises';
import path from 'path';

const MIME: Record<string, string> = {
  '.pdf':  'application/pdf',
  '.doc':  'application/msword',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  '.ppt':  'application/vnd.ms-powerpoint',
  '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  '.xls':  'application/vnd.ms-excel',
  '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.svg':  'image/svg+xml',
  '.txt':  'text/plain; charset=utf-8',
  '.zip':  'application/zip',
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { filename } = await params;

  // Prevenir path traversal
  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    const buffer = await readFile(filepath);
    const ext    = path.extname(filename).toLowerCase();
    const mime   = MIME[ext] ?? 'application/octet-stream';

    // PDFs e imágenes → inline (previsualización en browser)
    // Resto → attachment (descarga directa)
    const inline = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg'].includes(ext);
    const disposition = inline
      ? `inline; filename="${filename}"`
      : `attachment; filename="${filename}"`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mime,
        'Content-Disposition': disposition,
        'Cache-Control': 'private, max-age=31536000',
      },
    });
  } catch {
    return new NextResponse('File not found', { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthorized', { status: 401 });

  const { filename } = await params;

  if (!filename || filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
    return new NextResponse('Bad request', { status: 400 });
  }

  const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

  try {
    await unlink(filepath);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // si ya no existe, igual ok
  }
}
