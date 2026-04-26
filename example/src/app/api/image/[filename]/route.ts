import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR = '/tmp/haozanai-uploads'

// 扩展名 → MIME
const MIME: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // 防止路径穿越
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const filePath = path.join(UPLOAD_DIR, filename)

  try {
    await stat(filePath) // 文件不存在会 throw
    const buffer = await readFile(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME[ext] || 'application/octet-stream'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 缓存 1 天
      },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
