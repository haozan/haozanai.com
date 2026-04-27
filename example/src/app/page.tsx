'use client'
import Section from '@/components/Section'
import dynamic from 'next/dynamic'

const Editor = dynamic(() => import('@/components/Editor'), {
  ssr: false,
  loading: () => (
    <div className="h-[96vh] md:h-[96vh] w-full border border-[#00E5CC]/20 rounded-xl my-3 bg-[#090d14] flex items-center justify-center" style={{ height: 'calc(100dvh - 80px)' }}>
      <div className="flex flex-col items-center gap-3 text-[#00E5CC]/60">
        <svg className="animate-spin w-8 h-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <span className="text-sm font-mono">加载中…</span>
      </div>
    </div>
  ),
})

export default function Home() {
  return (
    <div>
      <Section className='relative'><Editor /></Section>
    </div>
  )
}
