/** @type {import('next').NextConfig} */
import createMDX from '@next/mdx'

const nextConfig = {
  // Configure `pageExtensions` to include markdown and MDX files
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  output: 'standalone',
  // 开启 gzip 压缩（standalone 模式下 Next.js 不默认开压缩）
  compress: true,
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [],
    rehypePlugins: [],
  },
})

export default withMDX(nextConfig)
