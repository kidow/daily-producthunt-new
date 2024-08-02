import { SpeedInsights } from '@vercel/speed-insights/next'
import { Backdrop, Toast } from 'containers'
import type { Metadata } from 'next'
import Script from 'next/script'

import './globals.css'

export interface Props extends ReactProps {}

export function generateMetadata(): Metadata {
  const title = '일간 ProductHunt'
  const description = '매일매일 ProductHunt 상위 5개 제품을 소개합니다.'
  return {
    title,
    description,
    applicationName: title,
    generator: 'Next.js',
    keywords: ['nextjs', 'producthunt', 'vercel', 'tailwindcss', 'typescript'],
    themeColor: '#FF6154',
    creator: 'kidow',
    publisher: 'Vercel',
    robots: 'index, follow',
    alternates: {
      canonical: process.env.NEXT_PUBLIC_BASE_URL
    },
    openGraph: {
      title,
      description,
      url: process.env.NEXT_PUBLIC_BASE_URL
    },
    twitter: {
      title,
      description,
      creator: '__kidow__',
      card: 'summary_large_image'
    },
    verification: {
      google: 'iOZSvTkUwxiTVHLqRigAXocT03NlO-xG1ZbAzbVwYC4',
      other: {
        'naver-site-verification': 'ce1d027ada07aaee74e83540121ce08c9e04fb14'
      }
    },
    category: 'Media',
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL)
  }
}

export default function RootLayout({ children }: Props) {
  return (
    <html lang="ko">
      <body>
        <Script
          id="gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WVMQ8J6T');`
          }}
        />
        {children}
        <Backdrop />
        <Toast />
        <SpeedInsights />
      </body>
    </html>
  )
}
