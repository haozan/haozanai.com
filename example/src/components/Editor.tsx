'use client';
import React, { useState, ChangeEvent, useRef, useEffect } from 'react'
import '@/styles/markdown-to-image-slim.css'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster, Md2PosterFooter } from 'markdown-to-image'
import { Copy, LoaderCircle, Download, Palette, ImageUp, FileEdit, Eye } from 'lucide-react'
import { domToPng } from 'modern-screenshot'

type IThemeType = 'SpringGradientWave'
type IGradientTheme = 'gradient:aurora' | 'gradient:galaxy' | 'gradient:forest' | 'gradient:sakura' | 'gradient:lava'
  | 'gradient:neon' | 'gradient:latte' | 'gradient:nebula' | 'gradient:glacier' | 'gradient:desert' | 'gradient:morandi'
type IExtendedTheme = IThemeType | IGradientTheme

const GRADIENT_CLASS_MAP: Record<IGradientTheme, string> = {
  'gradient:aurora':   'bg-gradient-aurora',
  'gradient:galaxy':   'bg-gradient-galaxy',
  'gradient:forest':   'bg-gradient-forest',
  'gradient:sakura':   'bg-gradient-sakura',
  'gradient:lava':     'bg-gradient-lava',
  'gradient:neon':     'bg-gradient-neon',
  'gradient:latte':    'bg-gradient-latte',
  'gradient:nebula':   'bg-gradient-nebula',
  'gradient:glacier':  'bg-gradient-glacier',
  'gradient:desert':   'bg-gradient-desert',
  'gradient:morandi':  'bg-gradient-morandi',
}

const THEMES: { value: IExtendedTheme; label: string }[] = [
  { value: 'SpringGradientWave',  label: '🌊 春日渐变' },
  { value: 'gradient:aurora',     label: '🌅 极光晨曦' },
  { value: 'gradient:galaxy',     label: '🌙 深海星空' },
  { value: 'gradient:forest',     label: '🍃 翠绿森林' },
  { value: 'gradient:sakura',     label: '🌸 樱花粉梦' },
  { value: 'gradient:lava',       label: '🔥 熔岩日落' },
  { value: 'gradient:neon',       label: '🌊 霓虹赛博' },
  { value: 'gradient:latte',      label: '☕ 焦糖拿铁' },
  { value: 'gradient:nebula',     label: '🌌 星云紫霞' },
  { value: 'gradient:glacier',    label: '🏔 冰川蓝' },
  { value: 'gradient:desert',     label: '🌅 沙漠金' },
  { value: 'gradient:morandi',    label: '🎨 莫兰迪' },
]

const defaultMd = `# 青狮海报大师 使用指南

## 如何使用

本页面内容由 **[青狮龙虾](https://qingclaw.com)** 的技能 **青狮海报大师 Skill** 撰写生成。

使用步骤：

1. 在左侧编辑器中输入或粘贴 Markdown 内容
2. 右侧实时预览海报效果
3. 如需插入图片，点击左上角「**插入图片**」按钮
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
  const [theme, setTheme] = useState<IExtendedTheme>('SpringGradientWave')
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const [uploadLoading, setUploadLoading] = useState(false)
  // 移动端 tab：'edit' | 'preview'
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')
  // 是否为移动端（< 768px），用于避免桌面端挂载移动端海报节点
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setIsMobile(mq.matches)
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  const markdownRef = useRef<any>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdString(e.target.value)
  }

  // 在光标位置插入文本
  const insertAtCursor = (text: string, scrollPreview = false) => {
    const el = textareaRef.current
    if (!el) {
      setMdString(prev => prev + '\n' + text)
      return
    }
    const start = el.selectionStart
    const end = el.selectionEnd
    const newVal = mdString.slice(0, start) + text + mdString.slice(end)
    setMdString(newVal)
    requestAnimationFrame(() => {
      el.focus()
      const newPos = start + text.length
      el.setSelectionRange(newPos, newPos)
      const lineHeight = parseInt(getComputedStyle(el).lineHeight) || 20
      const lines = newVal.slice(0, newPos).split('\n').length
      const scrollTarget = (lines - 1) * lineHeight
      el.scrollTop = scrollTarget - el.clientHeight / 2

      if (scrollPreview) {
        setTimeout(() => {
          const preview = previewRef.current
          if (!preview) return
          const imgs = preview.querySelectorAll('img')
          if (imgs.length === 0) return
          const lastImg = imgs[imgs.length - 1]
          lastImg.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 300)
      }
    })
  }

  // 上传图片到本地服务器
  const handleUploadImage = async (file: File) => {
    setUploadLoading(true)
    try {
      const formData = new FormData()
      formData.append('image', file)
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (json.success && json.data?.url) {
        const altName = file.name.replace(/\.[^.]+$/, '') || 'image'
        insertAtCursor(`![${altName}](${json.data.url})`, true)
      } else {
        alert('上传失败：' + (json.message || '未知错误'))
      }
    } catch (e) {
      alert('上传失败，请检查网络连接')
    } finally {
      setUploadLoading(false)
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
    const injectedSpans: HTMLElement[] = []
    try {
      const root = document.querySelector('.markdown-to-image-root') as HTMLElement
      const posterEl = root?.firstElementChild as HTMLElement
      if (!posterEl) {
        alert('下载失败，找不到海报元素')
        return
      }

      document.body.classList.add('screenshot-mode')
      const olLists = posterEl.querySelectorAll<HTMLOListElement>('article ol')
      olLists.forEach((ol) => {
        const items = ol.querySelectorAll<HTMLLIElement>(':scope > li')
        items.forEach((li, idx) => {
          const span = document.createElement('span')
          span.setAttribute('data-marker-inject', '1')
          span.style.cssText = `
            position: absolute;
            left: 0;
            top: 0;
            min-width: 1.4em;
            text-align: left;
            font-size: 1em;
            line-height: inherit;
            color: inherit;
            pointer-events: none;
          `
          span.textContent = `${idx + 1}.`
          li.appendChild(span)
          injectedSpans.push(span)
        })
      })

      const dataUrl = await domToPng(posterEl, { scale: 2 })
      const link = document.createElement('a')
      link.download = `poster-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (e) {
      console.error('下载失败', e)
      alert('下载失败，请重试')
    } finally {
      injectedSpans.forEach((s) => s.remove())
      document.body.classList.remove('screenshot-mode')
      setDownloadLoading(false)
    }
  }

  // ── 海报预览节点（函数形式，每次调用独立实例，避免同一 JSX 节点被渲染两次）──
  const renderPoster = (ref?: React.Ref<any>) => (
    <Md2Poster
      theme={'SpringGradientWave'}
      className={
        theme in GRADIENT_CLASS_MAP
          ? GRADIENT_CLASS_MAP[theme as IGradientTheme]
          : undefined
      }
      copySuccessCallback={() => {}} ref={ref}>
      <Md2PosterContent articleClassName="prose prose-gray prose-img:rounded-lg prose-img:border prose-img:opacity-100 text-justify">
        {mdString}
      </Md2PosterContent>
      <Md2PosterFooter className='text-center'>
        Powered by 青狮龙虾
      </Md2PosterFooter>
    </Md2Poster>
  )

  // ── 操作按钮组（桌面端右上角 / 移动端底部栏复用）──
  const actionButtons = (isMobile = false) => (
    <>
      {/* Theme picker */}
      <div className="relative">
        <Button
          className="rounded-xl bg-[#131920] text-[#00E5CC] font-semibold border border-[#00E5CC]/40
            hover:bg-[#00E5CC]/10 hover:border-[#00E5CC]/80 transition-all h-9 px-3 text-sm"
          onClick={() => setShowThemePicker(v => !v)}
        >
          <Palette className="w-4 h-4 mr-1 shrink-0" />
          <span className="hidden sm:inline">主题</span>
        </Button>

        {showThemePicker && (
          <div className={`absolute z-50 bg-[#131920] border border-[#00E5CC]/20
            rounded-xl shadow-glow-cyan p-2 flex flex-col gap-1 min-w-[150px]
            ${isMobile ? 'bottom-11 right-0' : 'top-11 right-0'}`}>
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

      {/* Download */}
      <Button
        className="rounded-xl bg-[#131920] text-[#00E5CC] font-semibold border border-[#00E5CC]/40
          hover:bg-[#00E5CC]/10 hover:border-[#00E5CC]/80 transition-all h-9 px-3 text-sm"
        onClick={handleDownload}
        disabled={downloadLoading}
      >
        {downloadLoading
          ? <LoaderCircle className="w-4 h-4 mr-1 animate-spin shrink-0" />
          : <Download className="w-4 h-4 mr-1 shrink-0" />}
        <span className="hidden sm:inline">下载</span>
      </Button>

      {/* Copy */}
      <Button
        className="rounded-xl bg-[#00E5CC] text-[#090d14] font-semibold
          hover:bg-[#00E5CC]/90 shadow-glow-cyan border-0 h-9 px-3 text-sm"
        onClick={handleCopy}
        disabled={copyLoading}
      >
        {copyLoading
          ? <LoaderCircle className="w-4 h-4 mr-1 animate-spin shrink-0" />
          : <Copy className="w-4 h-4 mr-1 shrink-0" />}
        复制图片
      </Button>
    </>
  )

  return (
    <>
      {/* ════════════════════════════════════════
          桌面端布局（md 及以上）
      ════════════════════════════════════════ */}
      <div className="flex flex-col h-[96vh] w-full border border-[#00E5CC]/20 rounded-xl my-4 relative bg-[#090d14] shadow-glow-cyan overflow-hidden"
        style={{ display: isMobile ? 'none' : 'flex' }}>
        <ScrollArea className="h-full w-full">
          <div className="flex flex-row h-full">
            {/* Left: Editor */}
            <div className="w-1/2 border-r border-[#00E5CC]/10 flex flex-col">
              {/* Toolbar */}
              <div className="flex items-center gap-2 px-4 py-2 border-b border-[#00E5CC]/10 bg-[#0d1117]">
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
                  {uploadLoading ? '上传中...' : '插入图片'}
                </button>
                <span className="text-[hsl(220,14%,30%)] text-xs">支持 JPG / PNG / GIF · 自动插入光标</span>
              </div>

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
            <div ref={previewRef} className="w-1/2 flex justify-center items-start px-4 py-4 bg-[#0d1117] overflow-auto">
              <div className="flex flex-col w-fit">
                {renderPoster(markdownRef)}
              </div>
            </div>
          </div>

          {/* Desktop action buttons */}
          <div className="absolute top-4 right-4 flex flex-row gap-2 opacity-80 hover:opacity-100 transition-all">
            {actionButtons(false)}
          </div>
        </ScrollArea>
      </div>

      {/* ════════════════════════════════════════
          移动端布局（小于 md）
      ════════════════════════════════════════ */}
      <div className="flex flex-col w-full border border-[#00E5CC]/20 rounded-xl my-3 bg-[#090d14] shadow-glow-cyan overflow-hidden"
        style={{ display: isMobile ? 'flex' : 'none', height: 'calc(100dvh - 80px)' }}>

        {/* 顶部 Tab 切换栏 */}
        <div className="flex items-center bg-[#0d1117] border-b border-[#00E5CC]/10 px-3 py-2 gap-2 shrink-0">
          <button
            onClick={() => setMobileTab('edit')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${mobileTab === 'edit'
                ? 'bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/40'
                : 'text-[hsl(220,14%,55%)] border border-transparent hover:text-[#00E5CC]/70'}`}
          >
            <FileEdit className="w-4 h-4" />
            编辑
          </button>
          <button
            onClick={() => setMobileTab('preview')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all
              ${mobileTab === 'preview'
                ? 'bg-[#00E5CC]/15 text-[#00E5CC] border border-[#00E5CC]/40'
                : 'text-[hsl(220,14%,55%)] border border-transparent hover:text-[#00E5CC]/70'}`}
          >
            <Eye className="w-4 h-4" />
            预览
          </button>

          {/* 插入图片（仅编辑 tab 显示） */}
          {mobileTab === 'edit' && (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLoading}
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                border border-[#00E5CC]/30 bg-[#131920] text-[hsl(220,14%,65%)]
                hover:text-[#00E5CC] hover:border-[#00E5CC]/70 hover:bg-[#00E5CC]/10
                transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploadLoading
                ? <LoaderCircle className="w-3.5 h-3.5 animate-spin" />
                : <ImageUp className="w-3.5 h-3.5" />}
              {uploadLoading ? '上传中' : '插入图片'}
            </button>
          )}
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden relative">
          {/* 编辑面板 */}
          <div className={`absolute inset-0 transition-opacity duration-200 ${mobileTab === 'edit' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
            <textarea
              ref={textareaRef}
              placeholder="在此输入 Markdown 内容..."
              className="border-none bg-[#131920] p-4 w-full h-full resize-none
                focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0
                text-[hsl(220,14%,65%)] hover:text-[hsl(220,14%,80%)] focus:text-[hsl(210,20%,90%)]
                placeholder:text-[hsl(220,14%,35%)] font-light font-mono text-sm transition-colors"
              value={mdString}
              onChange={handleChange}
            />
          </div>

          {/* 预览面板 */}
          <div
            ref={previewRef}
            className={`absolute inset-0 overflow-y-auto bg-[#0d1117] flex justify-center px-3 py-4 transition-opacity duration-200
              ${mobileTab === 'preview' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          >
            <div className="w-full max-w-[400px]">
              {isMobile && mobileTab === 'preview' && renderPoster(null)}
            </div>
          </div>
        </div>

        {/* 底部操作栏 */}
        <div className="shrink-0 flex items-center justify-end gap-2 px-3 py-2 bg-[#0d1117] border-t border-[#00E5CC]/10">
          {actionButtons(true)}
        </div>
      </div>

      {/* Hidden file input (共享) */}
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
    </>
  )
}
