import Link from 'next/link'
import Image from 'next/image'

export default function Header() {
  return (
    <nav
      className="flex w-full justify-center py-4 items-center
        border-b border-[#00E5CC]/20 bg-[#090d14]/80 backdrop-blur-2xl font-mono text-sm px-4 lg:px-0"
    >
      <div className="max-w-6xl flex w-full items-center justify-between">
        {/* Logo */}
        <div className="font-medium text-xl flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <Image src="/logo.png" alt="QingClaw logo" width={28} height={28} />
            <span className="text-brand-gradient font-bold tracking-tight">
              青狮海报大师
            </span>
          </Link>
          <span className="hidden sm:inline text-[hsl(220,14%,40%)] text-xs font-normal tracking-normal">
            由律师专属 AI 助理{' '}
            <a
              href="https://qingclaw.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#00E5CC]/70 hover:text-[#00E5CC] transition-colors"
            >
              青狮龙虾
            </a>
            {' '}驱动
          </span>
        </div>
      </div>
    </nav>
  )
}
