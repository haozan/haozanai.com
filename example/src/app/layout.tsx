import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "青狮海报大师 · Markdown 一键生成精美海报",
  description: "青狮海报大师：将 Markdown 渲染成精美海报图片，支持一键复制为图片。支持海报/卡片/引用/Instagram/Twitter/Facebook 多种风格。",
  keywords: ["青狮海报大师", "海报生成", "poster image", "海报", "卡片", "图片", "markdown", "ai", "markdown to poster", "markdown to image", "markdown to card", "markdown to quote", "instagram", "twitter", "facebook"],
  creator: "haozanai.com",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icon-192-maskable.png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Header></Header>{children}<Footer></Footer>
        <Analytics />
      </body>
    </html>
  );
}
