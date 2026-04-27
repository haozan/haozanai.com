import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir, readdir, stat, unlink } from 'fs/promises'
import path from 'path'
import { randomUUID } from 'crypto'
import sharp from 'sharp'

// 临时文件目录（容器重启自动清空，无需额外清理）
const UPLOAD_DIR = '/tmp/haozanai-uploads'
// 超过多少小时的文件视为过期（顺带清理）
const EXPIRE_HOURS = 24
// WebP 压缩质量（0-100），80 在质量和体积间取得很好平衡
const WEBP_QUALITY = 80
// effort=1：最快编码速度，体积比默认 effort=4 仅大约 5-8%，但速度快 2x
// effort=4（默认）：对于 3000x2000 噪声图测试耗时 168ms，effort=1 仅 84ms
const WEBP_EFFORT = 1
// 最长边限制（px），超过则等比缩放；海报宽度最多 560px，图片不需要超宽
const MAX_DIMENSION = 1600

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

    const inputBuffer = Buffer.from(await file.arrayBuffer())

    // GIF 保留原格式（sharp 转 webp 会丢失动画帧，需要 {animated:true} 且体积不一定更小）
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')

    let outputBuffer: Buffer
    let ext: string

    if (isGif) {
      // GIF 原样保存，不压缩
      outputBuffer = inputBuffer
      ext = 'gif'
    } else {
      // JPG / PNG / WebP / BMP 等 → 转 WebP，等比缩放不超过 MAX_DIMENSION
      outputBuffer = await sharp(inputBuffer)
        .resize(MAX_DIMENSION, MAX_DIMENSION, {
          fit: 'inside',          // 等比缩小，不裁剪，不放大
          withoutEnlargement: true,
        })
        .webp({ quality: WEBP_QUALITY, effort: WEBP_EFFORT })
        .toBuffer()
      ext = 'webp'
    }

    // 生成唯一文件名
    const filename = `${randomUUID()}.${ext}`
    const filePath = path.join(UPLOAD_DIR, filename)
    await writeFile(filePath, outputBuffer)

    // 异步清理过期文件，不阻塞本次响应
    cleanExpired()

    // 打印压缩比，方便调试
    const ratio = ((1 - outputBuffer.length / inputBuffer.length) * 100).toFixed(1)
    console.log(`[upload] ${file.name} (${(inputBuffer.length / 1024).toFixed(0)}KB) → ${filename} (${(outputBuffer.length / 1024).toFixed(0)}KB, -${ratio}%)`)

    return NextResponse.json({
      success: true,
      data: { url: `/api/image/${filename}` },
    })
  } catch (e) {
    console.error('[upload] error:', e)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
}
