import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) return NextResponse.json({ error: 'Archivo demasiado grande (máx 10MB)' }, { status: 400 });

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  const ext = path.extname(file.name) || '';
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}-${safeName}`;
  const filepath = path.join(uploadDir, filename);

  await writeFile(filepath, buffer);

  const isImage = /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(ext);

  return NextResponse.json({
    url: `/uploads/${filename}`,      // rewrite → /api/files/:filename (autenticado)
    name: file.name,
    size: file.size,
    type: file.type,
    isImage,
  });
}
