import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'

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
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename } = await params

  // 防止路径穿越
  if (!filename || filename.includes('..') || filename.includes('/')) {
    return new NextResponse('Not Found', { status: 404 })
  }

  const filePath = path.join(UPLOAD_DIR, filename)

  try {
    const fileStat = await stat(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    const contentType = MIME[ext] || 'application/octet-stream'

    // ETag：文件大小 + 最后修改时间的 hash，轻量且足够唯一
    const etag = `"${createHash('md5')
      .update(`${fileStat.size}-${fileStat.mtimeMs}`)
      .digest('hex')}"`

    // 304 协商缓存：如果浏览器携带 If-None-Match 且匹配，直接返回 304
    const ifNoneMatch = req.headers.get('if-none-match')
    if (ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': etag,
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      })
    }

    const buffer = await readFile(filePath)

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        // 强缓存 7 天 + 过期后 stale-while-revalidate 允许后台刷新
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        'ETag': etag,
        'Last-Modified': fileStat.mtime.toUTCString(),
      },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
