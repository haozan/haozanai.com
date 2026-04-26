'use client';
import React, { useState, ChangeEvent, useRef } from 'react'
import '@/styles/markdown-to-image-slim.css'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster, Md2PosterFooter } from 'markdown-to-image'
import { Copy, LoaderCircle, Download, Palette, ImageUp } from 'lucide-react'
import { domToPng } from 'modern-screenshot'

type IThemeType = 'blue' | 'pink' | 'purple' | 'green' | 'yellow' | 'gray' | 'red' | 'indigo' | 'SpringGradientWave'

const THEMES: { value: IThemeType; label: string }[] = [
  { value: 'SpringGradientWave', label: '🌊 春日渐变' },
  { value: 'blue',   label: '🔵 蓝' },
  { value: 'pink',   label: '🌸 粉' },
  { value: 'purple', label: '🟣 紫' },
  { value: 'green',  label: '🟢 绿' },
  { value: 'yellow', label: '🟡 黄' },
  { value: 'gray',   label: '⚪ 灰' },
  { value: 'red',    label: '🔴 红' },
  { value: 'indigo', label: '🌌 靛蓝' },
]

const defaultMd = `# 青狮海报大师 使用指南

## 如何使用

本页面内容由 **[青狮龙虾](https://qingclaw.com)** 的技能 **青狮海报大师 Skill** 撰写生成。

使用步骤：

1. 在左侧编辑器中输入或粘贴 Markdown 内容
2. 右侧实时预览海报效果
3. 如需插入图片，点击左上角「**上传图片**」按钮
4. 选择合适的「**主题**」风格
5. 点击「**下载**」保存为 PNG 图片，或「**复制图片**」直接粘贴使用

---

## 关于青狮龙虾

**青狮龙虾（QingClaw）** 是一款**律师专属 AI 助理**，由镐赞团队出品。

### 核心价值

- 🕐 **节省 90% 时间** —— 处理卷宗、起草文书、整理庭审记录，过去要助理干的活，龙虾全包
- 🧠 **拉平顶尖律师差距** —— 用自己的 API Key 直连全球顶尖 AI 模型，让新律师也能用上行业大佬同级别的「法律脑」
- 📣 **提升 3× 运营能力** —— 公众号、小红书、视频脚本、文章，一个人撑起律师品牌全部内容运营

### 交付的 16 项技能（部分）

| 技能 | 场景 |
|------|------|
| AI 法律咨询 | 当事人说完案情，秒出法律意见 |
| AI 合同审核 | 一键输出带批注修订的 Word |
| AI 文书撰写 | 自动起草起诉状、答辩状、代理意见 |
| AI 诉讼可视化 | 案件关系图、证据链、时间轴一键生成 |
| AI 公众号写作 | 输入话题，自动生成律师品牌文章 |
| AI 小红书图文 | 法律知识变成小红书爆款图文 |
| **青狮海报大师** | Markdown 一键生成精美海报 ✅ |

> 官网：[qingclaw.com](https://qingclaw.com)
`

export default function Editor() {
  const [mdString, setMdString] = useState(defaultMd)
  const [theme, setTheme] = useState<IThemeType>('SpringGradientWave')
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  const markdownRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdString(e.target.value)
  }

  // 在光标位置插入文本
  const insertAtCursor = (text: string) => {
    const el = textareaRef.current
    if (!el) {
      setMdString(prev => prev + '\n' + text)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const newVal = mdString.slice(0, start) + text + mdString.slice(end)
    setMdString(newVal)
    // 等待 DOM 更新后恢复光标
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + text.length, start + text.length)
    })
  }

  // 上传图片到 img.scdn.io
  const handleUploadImage = async (file: File) => {
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('https://img.scdn.io/api/v1.php', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success && json.data?.url) {
        const altName = file.name.replace(/\.[^.]+$/, '') || 'image'
        insertAtCursor(`![${altName}](${json.data.url})`)
      } else {
        alert('上传失败：' + (json.message || '未知错误'))
      }
    } catch (e) {
      alert('上传失败，请检查网络连接')
    } finally {
      setUploadLoading(false)
      // 清空 file input，允许重复上传同一文件
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleCopy = () => {
    setCopyLoading(true)
    markdownRef?.current?.handleCopy().then(() => {
      setCopyLoading(false)
      alert('Copy Success!')
    }).catch((err: any) => {
      setCopyLoading(false)
      console.log('err copying from child', err)
    })
  }

  const handleDownload = async () => {
    setDownloadLoading(true)
    try {
      const root = document.querySelector('.markdown-to-image-root') as HTMLElement
      const posterEl = root?.firstElementChild as HTMLElement
      if (!posterEl) {
        alert('下载失败，找不到海报元素')
        return
      }
      const dataUrl = await domToPng(posterEl, { scale: 2 })
      const link = document.createElement('a')
      link.download = `poster-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('下载失败', e)
      alert('下载失败，请重试')
    } finally {
      setDownloadLoading(false)
    }
  }

  return (
    <div className="h-[96vh] w-full border border-[#00E5CC]/20 rounded-xl my-4 relative bg-[#090d14] shadow-glow-cyan overflow-hidden">
      <ScrollArea className="h-full w-full">
      <div className="flex flex-row h-full">
        {/* Left: Editor */}
        <div className="w-1/2 border-r border-[#00E5CC]/10 flex flex-col">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00E5CC]/10 bg-[#0d1117]">
            {/* 上传图片按钮 */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                border border-[#00E5CC]/30 bg-[#131920] text-[hsl(220,14%,65%)]
                hover:text-[#00E5CC] hover:border-[#00E5CC]/70 hover:bg-[#00E5CC]/10
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadLoading
                ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                : <ImageUp className="w-3.5 h-3.5" />}
              {uploadLoading ? '上传中...' : '上传图片'}
            </button>
            <span className="text-[hsl(220,14%,30%)] text-xs">支持 JPG / PNG / GIF · 自动插入光标</span>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleUploadImage(file)
            }}
          />

          <textarea
            ref={textareaRef}
            placeholder="markdown"
            className="border-none bg-[#131920] p-8 w-full resize-none flex-1 min-h-[calc(100vh-48px)]
              focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0
              text-[hsl(220,14%,65%)] hover:text-[hsl(220,14%,80%)] focus:text-[hsl(210,20%,90%)]
              placeholder:text-[hsl(220,14%,35%)] font-light font-mono transition-colors"
            value={mdString}
            onChange={handleChange}
          />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 flex justify-center items-start px-4 py-4 bg-[#0d1117] overflow-auto">
          <div className="flex flex-col w-fit">
            <Md2Poster theme={theme} copySuccessCallback={() => {}} ref={markdownRef}>
              <Md2PosterContent articleClassName="prose prose-gray prose-img:rounded-lg prose-img:border prose-img:opacity-100 text-justify">{mdString}</Md2PosterContent>
              <Md2PosterFooter className='text-center'>
                Powered by 青狮龙虾
              </Md2PosterFooter>
            </Md2Poster>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="absolute top-4 right-4 flex flex-row gap-2 opacity-80 hover:opacity-100 transition-all">

        {/* Theme picker */}
        <div className="relative">
          <Button
            className="rounded-xl bg-[#131920] text-[#00E5CC] font-semibold border border-[#00E5CC]/40
              hover:bg-[#00E5CC]/10 hover:border-[#00E5CC]/80 transition-all"
            onClick={() => setShowThemePicker(v => !v)}
          >
            <Palette className="w-4 h-4 mr-1" />
            主题
          </Button>

          {showThemePicker && (
            <div className="absolute right-0 top-11 z-50 bg-[#131920] border border-[#00E5CC]/20
              rounded-xl shadow-glow-cyan p-2 flex flex-col gap-1 min-w-[140px]">
              {THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => { setTheme(t.value); setShowThemePicker(false) }}
                  className={`px-3 py-2 rounded-lg text-sm text-left transition-colors
                    ${theme === t.value
                      ? 'bg-[#00E5CC]/20 text-[#00E5CC] font-semibold'
                      : 'text-[hsl(220,14%,65%)] hover:bg-[#00E5CC]/10 hover:text-[#00E5CC]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Download button */}
        <Button
          className="rounded-xl bg-[#131920] text-[#00E5CC] font-semibold border border-[#00E5CC]/40
            hover:bg-[#00E5CC]/10 hover:border-[#00E5CC]/80 transition-all"
          onClick={handleDownload}
          disabled={downloadLoading}
        >
          {downloadLoading
            ? <LoaderCircle className="w-4 h-4 mr-1 animate-spin" />
            : <Download className="w-4 h-4 mr-1" />}
          下载
        </Button>

        {/* Copy button */}
        <Button
          className="rounded-xl bg-[#00E5CC] text-[#090d14] font-semibold
            hover:bg-[#00E5CC]/90 shadow-glow-cyan border-0"
          onClick={handleCopy}
          disabled={copyLoading}
        >
          {copyLoading
            ? <LoaderCircle className="w-4 h-4 mr-1 animate-spin" />
            : <Copy className="w-4 h-4 mr-1" />}
          复制图片
        </Button>
      </div>
    </ScrollArea>
    </div>
  )
}
