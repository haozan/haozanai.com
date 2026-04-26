'use client';
import React, { useState, ChangeEvent, useRef } from 'react'
import '@/styles/markdown-to-image-slim.css'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster, Md2PosterFooter } from 'markdown-to-image'
import { Copy, LoaderCircle, Download, Palette, ImageUp } from 'lucide-react';

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

  const handleDownload = () => {
    setDownloadLoading(true)
    const root = document.querySelector('.markdown-to-image-root') as HTMLElement
    const posterEl = root?.firstElementChild as HTMLElement
    if (!posterEl) {
      setDownloadLoading(false)
      alert('下载失败，找不到海报元素')
      return
    }

    // html2canvas 不能正确处理 CSS logical properties（padding-inline-start 等）
    // 捕获前把所有 blockquote 强制设为物理属性的 inline style，捕获后还原
    const blockquotes = Array.from(posterEl.querySelectorAll('blockquote')) as HTMLElement[]
    const savedStyles = blockquotes.map(bq => bq.getAttribute('style') || '')

    // ⚠️ markdown 解析器 bug：表格末行 | 后紧跟 blockquote 时，会多出一个 <p>内容为行号</p>
    // 捕获前把 blockquote 内 innerText 为纯数字或空白的多余 p 元素隐藏，捕获后还原
    type RemovedP = { p: HTMLElement; parent: HTMLElement; nextSibling: Node | null }
    const removedPs: RemovedP[] = []
    blockquotes.forEach(bq => {
      const ps = Array.from(bq.querySelectorAll('p')) as HTMLElement[]
      ps.forEach(p => {
        const text = p.innerText.trim()
        // 纯数字 or 空字符串 → 是多余的 p
        if (/^\d*$/.test(text)) {
          removedPs.push({ p, parent: p.parentElement as HTMLElement, nextSibling: p.nextSibling })
          p.remove()
        }
      })
    })

    // html2canvas 对 blockquote 渲染存在两类差异：
    // 1. CSS logical properties (border-inline-start 等) 不认
    // 2. CSS !important 优先级反噬 inline 普通样式
    // 解决：所有 blockquote 和内部 p 的样式全部固化为 inline px + !important，
    //       同时注入临时 style 标签彻底消灭 ::before/::after 伪元素干扰
    // html2canvas 对 blockquote 渲染存在两类差异：
    // 1. CSS logical properties (border-inline-start 等) 不认
    // 2. CSS !important 优先级反噬 inline 普通样式
    // 解决：所有 blockquote 和内部 p 的样式全部固化为 inline px + !important
    type SavedP = { el: HTMLElement; style: string }
    const savedPs: SavedP[] = []
    // 注入临时 style 标签，绕过 CSS 优先级和 html2canvas 渲染差异
    const overrideId = '__h2c_blockquote_override__'
    let overrideStyle = document.getElementById(overrideId)
    if (!overrideStyle) {
      overrideStyle = document.createElement('style')
      overrideStyle.id = overrideId
      document.head.appendChild(overrideStyle)
    }
    const overrideRules: string[] = []

    blockquotes.forEach(bq => {
      const cs = window.getComputedStyle(bq)
      // 先清掉所有 logical padding/margin（无 !important），再设物理属性，确保物理属性生效
      // ⚠️ 绝不能加 'important'：inline !important 优先级最高，会把后面设的物理属性覆盖掉
      bq.style.removeProperty('padding-inline-start')
      bq.style.removeProperty('padding-inline-end')
      bq.style.removeProperty('padding-block-start')
      bq.style.removeProperty('padding-block-end')
      bq.style.removeProperty('margin-block-start')
      bq.style.removeProperty('margin-block-end')

      // ── 处理内部 p 元素的样式 ──
      const pEls = Array.from(bq.querySelectorAll('p')) as HTMLElement[]
      pEls.forEach(p => {
        const pCs = window.getComputedStyle(p)
        savedPs.push({ el: p, style: p.getAttribute('style') || '' })
        p.style.setProperty('line-height', pCs.lineHeight, 'important')
        p.style.setProperty('margin-top', pCs.marginTop, 'important')
        p.style.setProperty('margin-bottom', pCs.marginBottom, 'important')
        p.style.setProperty('font-size', pCs.fontSize, 'important')
        // html2canvas 将文字渲染在行盒底部，浏览器用 half-leading 居中
        const lineH = parseFloat(pCs.lineHeight)
        const fontS = parseFloat(pCs.fontSize)
        const halfLeading = (lineH - fontS) / 2
        p.style.setProperty('transform', `translateY(-${halfLeading.toFixed(1)}px)`, 'important')
      })

      // 固化物理 padding（!important 防 CSS 回冲）
      bq.style.setProperty('padding-left', cs.paddingLeft, 'important')
      bq.style.setProperty('padding-right', cs.paddingRight, 'important')
      bq.style.setProperty('padding-top', cs.paddingTop, 'important')
      bq.style.setProperty('padding-bottom', cs.paddingBottom, 'important')

      // 固化四边 border（inline !important 覆盖 CSS border-inline-start:none !important）
      bq.style.setProperty('border-top-width', '0px', 'important')
      bq.style.setProperty('border-top-style', 'none', 'important')
      bq.style.setProperty('border-right-width', '0px', 'important')
      bq.style.setProperty('border-right-style', 'none', 'important')
      bq.style.setProperty('border-bottom-width', '0px', 'important')
      bq.style.setProperty('border-bottom-style', 'none', 'important')
      bq.style.setProperty('border-left-width', cs.borderLeftWidth, 'important')
      bq.style.setProperty('border-left-color', cs.borderLeftColor, 'important')
      bq.style.setProperty('border-left-style', cs.borderLeftStyle, 'important')

      // 固化 margin + overflow + background + border-radius
      bq.style.setProperty('margin-top', cs.marginTop, 'important')
      bq.style.setProperty('margin-bottom', cs.marginBottom, 'important')
      bq.style.setProperty('margin-left', cs.marginLeft, 'important')
      bq.style.setProperty('margin-right', cs.marginRight, 'important')
      bq.style.setProperty('overflow', 'hidden', 'important')
      bq.style.setProperty('background-color', cs.backgroundColor, 'important')
      bq.style.setProperty('border-radius', cs.borderRadius, 'important')

      // 额外：强制覆盖 blockquote p::before/::after，防 html2canvas 误渲染引号伪元素
      const selector = `.markdown-to-image-root article blockquote:nth-of-type(${blockquotes.indexOf(bq) + 1})`
      overrideRules.push(`
        ${selector} p::before,
        ${selector} p::after {
          content: none !important;
          display: none !important;
        }
      `)
    })

    // 写入临时 style 标签
    overrideStyle.textContent = overrideRules.join('\n')
    console.log('[blockquote export] override style injected', overrideRules.length, 'rules')

    // 诊断日志：打印 blockquote 和内部 p 的关键 computed 值
    blockquotes.forEach((bq, i) => {
      const cs = window.getComputedStyle(bq)
      const pEls = Array.from(bq.querySelectorAll('p')) as HTMLElement[]
      const pCs = pEls.length > 0 ? window.getComputedStyle(pEls[0]) : null
      console.log(`[blockquote export] bq#${i}:`, {
        offsetTop: bq.offsetTop,
        p_count: pEls.length,
        bq_padding: `t=${cs.paddingTop} r=${cs.paddingRight} b=${cs.paddingBottom} l=${cs.paddingLeft}`,
        bq_margin: `t=${cs.marginTop} b=${cs.marginBottom} l=${cs.marginLeft} r=${cs.marginRight}`,
        bq_borderLeft: cs.borderLeftWidth,
        bq_overflow: cs.overflow,
        bq_background: cs.backgroundColor,
        bq_borderRadius: cs.borderRadius,
        p_lineHeight: pCs?.lineHeight,
        p_fontSize: pCs?.fontSize,
        p_margin: `t=${pCs?.marginTop} b=${pCs?.marginBottom}`,
      })
    })

    // 捕获前强制 poster 背景色，防边缘透白
    const posterOrigBg = posterEl.style.backgroundColor
    posterEl.style.backgroundColor = '#090d14'

    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(posterEl, { useCORS: true, scale: 2 }).then(canvas => {
        // 还原 poster 背景
        posterEl.style.backgroundColor = posterOrigBg
        // 还原被删除的多余 p 元素
        removedPs.forEach(({ p, parent, nextSibling }) => {
          parent.insertBefore(p, nextSibling)
        })
        // 还原 blockquote inline style
        blockquotes.forEach((bq, i) => {
          if (savedStyles[i]) {
            bq.setAttribute('style', savedStyles[i])
          } else {
            bq.removeAttribute('style')
          }
        })
        // 还原 p 元素 inline style
        savedPs.forEach(({ el, style }) => {
          if (style) el.setAttribute('style', style)
          else el.removeAttribute('style')
        })
        // 移除临时 style 标签
        if (overrideStyle) overrideStyle.remove()
        const link = document.createElement('a')
        link.download = `poster-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setDownloadLoading(false)
      }).catch(() => {
        posterEl.style.backgroundColor = posterOrigBg
        removedPs.forEach(({ p, parent, nextSibling }) => {
          parent.insertBefore(p, nextSibling)
        })
        blockquotes.forEach((bq, i) => {
          if (savedStyles[i]) bq.setAttribute('style', savedStyles[i])
          else bq.removeAttribute('style')
        })
        savedPs.forEach(({ el, style }) => {
          if (style) el.setAttribute('style', style)
          else el.removeAttribute('style')
        })
        if (overrideStyle) overrideStyle.remove()
        setDownloadLoading(false)
      })
    }).catch(() => setDownloadLoading(false))
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
