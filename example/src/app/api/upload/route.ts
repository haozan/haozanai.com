import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, stat, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'

// 临时文件目录（容器重启自动清空，无需额外清理）
const UPLOAD_DIR = '/tmp/haozanai-uploads'
// 超过多少小时的文件视为过期（顺带清理）
const EXPIRE_HOURS = 24

// 确保目录存在
async function ensureDir() {
  await mkdir(UPLOAD_DIR, { recursive: true })
}

// 清理超期文件（每次上传时顺手执行，异步不阻塞响应）
async function cleanExpired() {
  try {
    const files = await readdir(UPLOAD_DIR)
    const expireMs = EXPIRE_HOURS * 60 * 60 * 1000
    const now = Date.now()
    for (const file of files) {
      const filePath = path.join(UPLOAD_DIR, file)
      const s = await stat(filePath)
      if (now - s.mtimeMs > expireMs) {
        await unlink(filePath).catch(() => {})
      }
    }
  } catch {
    // 目录不存在等情况忽略
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ success: false, message: '未收到文件' }, { status: 400 })
    }

    // 校验类型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ success: false, message: '只允许上传图片' }, { status: 400 })
    }

    // 校验大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, message: '文件大小不能超过 10MB' }, { status: 400 })
    }

    await ensureDir()

    // 生成唯一文件名，保留原始扩展名
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
    const filename = `${randomUUID()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)

    const buffer = Buffer.from(await file.arrayBuffer())
    await writeFile(filePath, buffer)

    // 异步清理过期文件，不阻塞本次响应
    cleanExpired()

    return NextResponse.json({
      success: true,
      data: { url: `/api/image/${filename}` },
    })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}
