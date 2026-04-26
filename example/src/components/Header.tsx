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
        </div>

        {/* Nav links */}
        <div className="flex items-center justify-center gap-1 text-sm font-light text-steel">
          <p className="py-2 px-4 rounded-full flex justify-center items-center
              hover:text-[#00E5CC] hover:bg-[#00E5CC]/10 duration-200 transition-colors">
            <Link href="/">Web Editor</Link>
          </p>
          <p className="py-2 px-4 rounded-full flex justify-center items-center
              hover:text-[#00E5CC] hover:bg-[#00E5CC]/10 duration-200 transition-colors">
            <Link href="/docs">Docs</Link>
          </p>
          <p className="py-2 px-4 rounded-full flex justify-center items-center
              hover:text-[#00E5CC] hover:bg-[#00E5CC]/10 duration-200 transition-colors">
            <a
              href="https://github.com/gcui-art/markdown-to-image"
              target="_blank"
              className="flex items-center justify-center gap-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                fill="currentColor"
                viewBox="0 0 512 512"
                className="w-5 h-5"
              >
                <path d="M 171.3548387096774 407.741935483871 Q 170.32258064516128 411.8709677419355 166.19354838709677 411.8709677419355 Q 160 411.8709677419355 160 407.741935483871 Q 161.03225806451613 404.64516129032256 165.16129032258064 404.64516129032256 Q 170.32258064516128 404.64516129032256 171.3548387096774 407.741935483871 L 171.3548387096774 407.741935483871 Z M 139.3548387096774 403.61290322580646 Q 138.32258064516128 406.7096774193548 143.48387096774192 408.7741935483871 Q 148.6451612903226 409.80645161290323 149.67741935483872 406.7096774193548 Q 150.70967741935485 402.5806451612903 145.5483870967742 401.5483870967742 Q 140.38709677419354 400.51612903225805 139.3548387096774 403.61290322580646 L 139.3548387096774 403.61290322580646 Z M 184.7741935483871 401.5483870967742 Q 179.61290322580646 402.5806451612903 179.61290322580646 406.7096774193548 Q 180.6451612903226 409.80645161290323 185.80645161290323 409.80645161290323 Q 190.96774193548387 407.741935483871 190.96774193548387 403.61290322580646 Q 190.96774193548387 399.4838709677419 185.80645161290323 399.4838709677419 Q 180.6451612903226 399.4838709677419 184.7741935483871 401.5483870967742 L 184.7741935483871 401.5483870967742 Z M 256 32 C 132.3 32 32 134.9 32 261.7 C 32 363.1 100.3 449.1 195.3 479.2 C 207.4 481.3 212 473.9 212 467.5 C 212 461.1 211.7 439.7 211.7 416.2 C 211.7 416.2 148 429 134.2 390.8 C 134.2 390.8 123.1 362.8 107.2 355.8 C 107.2 355.8 85.1 340.7 108.8 341 C 108.8 341 132.9 342.7 146.1 365.8 C 167.1 403.5 203.4 392.8 212.3 386.1 C 214.4 371.9 220.6 362.1 227.4 356.5 C 177.7 350.9 127.6 343.7 127.6 259.5 C 127.6 235.4 135 223 148.2 208.6 C 146.1 202.6 138.1 177.7 150.3 145 C 170.4 138.9 212 167.2 212 167.2 C 228.7 162.2 246.7 159.7 264.7 159.7 C 282.7 159.7 300.7 162.2 317.4 167.2 C 317.4 167.2 358.9 138.8 379.1 145 C 391.4 177.7 383.3 202.6 381.2 208.6 C 394.4 223.1 402.8 235.5 402.8 259.5 C 402.8 343.9 350.5 350.8 300.8 356.5 C 309.5 363.6 317 377 317 398.4 C 317 429 316.7 454.1 316.7 467.5 C 316.7 473.9 321.3 481.3 333.4 479.2 C 428.4 449.1 496.7 363.1 496.7 261.7 C 480 134.9 379.7 32 256 32 Z"/>
              </svg>
              <span>Github</span>
            </a>
          </p>
        </div>
      </div>
    </nav>
  )
}
