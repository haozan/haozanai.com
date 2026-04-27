import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { createHash } from 'crypto'
import { LRUCache } from 'lru-cache'

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

// ── 内存 LRU 缓存 ──────────────────────────────────────────────
// 最多缓存 50 张图，总内存上限 50MB（服务端热点图片直接从内存返回，跳过磁盘 IO）
type CacheEntry = { buffer: Buffer; contentType: string; etag: string; lastModified: string }
const imageCache = new LRUCache<string, CacheEntry>({
  max: 50,
  maxSize: 50 * 1024 * 1024, // 50MB
  sizeCalculation: (v) => v.buffer.length,
  ttl: 1000 * 60 * 60, // 1 小时后自动过期（文件可能被清理）
})

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
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const contentType = MIME[ext] || 'application/octet-stream'

  // ── 先查内存缓存 ──────────────────────────────────────────────
  const cached = imageCache.get(filename)
  if (cached) {
    // 304 协商缓存
    const ifNoneMatch = req.headers.get('if-none-match')
    if (ifNoneMatch === cached.etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': cached.etag,
          'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        },
      })
    }
    return new NextResponse(cached.buffer, {
      status: 200,
      headers: {
        'Content-Type': cached.contentType,
        'Content-Length': String(cached.buffer.length),
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        'ETag': cached.etag,
        'Last-Modified': cached.lastModified,
        'X-Cache': 'HIT',
      },
    })
  }

  // ── 缓存未命中，读磁盘 ─────────────────────────────────────────
  try {
    const fileStat = await stat(filePath)

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
    const lastModified = fileStat.mtime.toUTCString()

    // 写入内存缓存
    imageCache.set(filename, { buffer, contentType, etag, lastModified })

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.length),
        // 强缓存 7 天 + 过期后 stale-while-revalidate 允许后台刷新
        'Cache-Control': 'public, max-age=604800, stale-while-revalidate=86400',
        'ETag': etag,
        'Last-Modified': lastModified,
        'X-Cache': 'MISS',
      },
    })
  } catch {
    return new NextResponse('Not Found', { status: 404 })
  }
}
