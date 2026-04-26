'use client';
import React, { useState, ChangeEvent, TextareaHTMLAttributes, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from './ui/button'
import { Md2PosterContent, Md2Poster, Md2PosterHeader, Md2PosterFooter } from 'markdown-to-image'
import { Copy, LoaderCircle, Download, Palette } from 'lucide-react';

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

const Textarea: React.FC<TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ onChange, ...rest }) => {
  return (
    <textarea
      className="border-none bg-[#131920] p-8 w-full resize-none h-full min-h-screen
        focus-visible:outline-none focus-visible:ring-0 focus-visible:border-0
        text-[hsl(220,14%,65%)] hover:text-[hsl(220,14%,80%)] focus:text-[hsl(210,20%,90%)]
        placeholder:text-[hsl(220,14%,35%)] font-light font-mono transition-colors"
      {...rest}
      onChange={(e) => onChange?.(e)}
    />
  )
}

const defaultMd = `# AI Morning News - April 29th
![image](https://imageio.forbes.com/specials-images/imageserve/64b5825a5b9b4d3225e9bd15/artificial-intelligence--ai/960x0.jpg?format=jpg&width=1440)
1. **MetaElephant Company Releases Multi-Modal Large Model XVERSE-V**: Supports image input of any aspect ratio, performs well in multiple authoritative evaluations, and has been open-sourced.
2. **Tongyi Qianwen Team Open-Sources Billion-Parameter Model Qwen1.5-110B**: Uses Transformer decoder architecture, supports multiple languages, and has an efficient attention mechanism.
3. **Shengshu Technology and Tsinghua University Release Video Large Model Vidu**: Adopts a fusion architecture of Diffusion and Transformer, generates high-definition videos with one click, leading internationally.
4. **Mutable AI Launches Auto Wiki v2**: Automatically converts code into Wikipedia-style articles, solving the problem of code documentation.
5. **Google Builds New Data Center in the U.S.**: Plans to invest $3 billion to build a data center campus in Indiana, expand facilities in Virginia, and launch an artificial intelligence opportunity fund.
6. **China Academy of Information and Communications Technology Releases Automobile Large Model Standard**: Aims to standardize and promote the intelligent development of the automotive industry.
7. Kimi Chat Mobile App Update: Version 1.2.1 completely revamps the user interface, introduces a new light mode, and provides a comfortable and intuitive experience.
  `

export default function Editor() {
  const [mdString, setMdString] = useState(defaultMd)
  const [theme, setTheme] = useState<IThemeType>('SpringGradientWave')
  const [showThemePicker, setShowThemePicker] = useState(false)
  const [copyLoading, setCopyLoading] = useState(false)
  const [downloadLoading, setDownloadLoading] = useState(false)
  const markdownRef = useRef<any>(null)

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMdString(e.target.value)
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
    // 找到 markdown-to-image 内部实际渲染的海报 DOM
    const root = document.querySelector('.markdown-to-image-root') as HTMLElement
    const posterEl = root?.firstElementChild as HTMLElement
    if (!posterEl) {
      setDownloadLoading(false)
      alert('下载失败，找不到海报元素')
      return
    }
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(posterEl, { useCORS: true, scale: 2 }).then(canvas => {
        const link = document.createElement('a')
        link.download = `poster-${Date.now()}.png`
        link.href = canvas.toDataURL('image/png')
        link.click()
        setDownloadLoading(false)
      }).catch(() => setDownloadLoading(false))
    }).catch(() => setDownloadLoading(false))
  }

  return (
    <ScrollArea className="h-[96vh] w-full border border-[#00E5CC]/20 rounded-xl my-4 relative bg-[#090d14] shadow-glow-cyan">
      <div className="flex flex-row h-full">
        {/* Left: Editor */}
        <div className="w-1/2 border-r border-[#00E5CC]/10">
          <Textarea placeholder="markdown" onChange={handleChange} defaultValue={mdString} />
        </div>

        {/* Right: Preview */}
        <div className="w-1/2 mx-auto flex justify-center p-4 bg-[#0d1117]">
          <div className="flex flex-col w-fit">
            <Md2Poster theme={theme} copySuccessCallback={() => {}} ref={markdownRef}>
              <Md2PosterHeader className="flex justify-center items-center px-4 font-medium text-lg">
                <span>{new Date().toISOString().slice(0, 10)}</span>
              </Md2PosterHeader>
              <Md2PosterContent>{mdString}</Md2PosterContent>
              <Md2PosterFooter className='text-center'>
                <img src="/logo.png" alt="logo" className='inline-block mr-2 w-5' />
                Powered by QingClaw.com
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
  )
}
