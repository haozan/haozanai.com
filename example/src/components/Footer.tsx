import Link from 'next/link'

export default function Footer() {
  return (
    <footer
      className="border-t border-purple-100 flex w-full justify-center py-4 items-center
         text-[#8E2DE2]/50 backdrop-blur-2xl font-mono text-sm px-4 lg:px-0
      "
    >
      <p
        className="px-6 py-3 rounded-full flex justify-center items-center gap-2
             hover:text-[#4A00E0] duration-200
                "
      ></p>
      <p
        className="px-6 py-3 rounded-full flex justify-center items-center gap-2"
      >
        <span>© 2024</span>
        <Link href="https://github.com/gcui-art/markdown-to-image/" className="hover:text-[#8E2DE2] transition-colors">gcui-art/markdown-to-image</Link>
      </p>
    </footer>
  )
}
