import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t border-[#00E5CC]/15 flex w-full justify-center py-4 items-center
         bg-[#090d14] text-steel backdrop-blur-2xl font-mono text-sm px-4 lg:px-0"
    >
      <p className="px-6 py-3 rounded-full flex justify-center items-center gap-2">
        <span className="text-[hsl(220,14%,55%)]">© 2025 青狮海报大师</span>
        <Link
          href="https://haozanai.com"
          className="text-[hsl(220,14%,55%)] hover:text-[#00E5CC] transition-colors duration-200"
        >
          haozanai.com
        </Link>
      </p>
    </footer>
  )
}
