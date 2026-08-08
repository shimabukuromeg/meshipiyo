import { GoogleTagManager } from '@next/third-parties/google'
import { HamburgerMenuIcon } from '@radix-ui/react-icons'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata } from 'next'
import { Noto_Sans_JP } from 'next/font/google'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar'
import { cn } from '@/lib/utils'
import './globals.css'

const noto = Noto_Sans_JP({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto',
})

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://meshipiyo.app',
  ),
  title: {
    default: '飯ぴよ｜沖縄のグルメ情報を探そう',
    template: '%s｜飯ぴよ',
  },
  description: '沖縄の飲食店や注目グルメを地域から探せるグルメ情報サイトです。',
  openGraph: {
    locale: 'ja_JP',
    siteName: '飯ぴよ',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className={cn('font-sans bg-background', noto.variable)}>
        <Menubar className="flex flex-row justify-between bg-white px-4 shadow-nav md:px-8">
          <Link href="/">
            <BrandLogo />
          </Link>
          <MenubarMenu>
            <MenubarTrigger>
              <HamburgerMenuIcon className="w-6 h-6" />
            </MenubarTrigger>
            <MenubarContent>
              <Link href="/">
                <MenubarItem>Top</MenubarItem>
              </Link>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
      {process.env.GOOGLE_TAG_MANAGER_ID && (
        <GoogleTagManager gtmId={process.env.GOOGLE_TAG_MANAGER_ID} />
      )}
    </html>
  )
}
