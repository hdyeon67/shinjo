import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Footer } from "@/components/footer";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { AdRails, AdBottomMobile } from "@/components/AdRails";
import { SITE, siteUrl } from "@/lib/config/site";
import { ADS_ENABLED, ADSENSE_CLIENT } from "@/lib/config/flags";

const SITE_URL = siteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "신조어 판독기 · 내 언어 나이는?",
    template: "%s · 신조어 판독기",
  },
  description: SITE.description,
  openGraph: {
    type: "website",
    siteName: SITE.name,
    title: "신조어 판독기 · 내 언어 나이는?",
    description: "최신 신조어 10문항. 요즘 밈으로 내 언어 나이와 세대를 판독해 친구와 대결해요.",
    // 홈/기본 공유용 브랜드 카드(1200×630). 결과 페이지는 자체 og:image 로 덮어씀.
    images: ["/api/og?fmt=home"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        {/* 픽셀 포인트 폰트 (라틴·숫자) — Y2K/싸이월드 감성 */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
        />
      </head>
      <body className="min-h-screen bg-cloud text-ink antialiased">
        <AnalyticsProvider />
        <AdRails />
        {ADS_ENABLED && (
          <Script
            id="adsbygoogle-init"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
        {children}
        {/* 모바일 하단 배너 — 응시("/quiz") 제외 전 페이지(랜딩 포함). 단위 ID 있을 때만 노출 */}
        <AdBottomMobile className="mx-auto flex max-w-md justify-center px-5 pb-4" />
        <Footer
          logoSrc={null}
          links={[
            { label: "가이드", href: "/guide/신조어-테스트" },
            { label: "소개", href: "/about" },
            { label: "개인정보처리방침", href: "/privacy" },
          ]}
          note="본 진단은 재미·참고용이며 언어 능력·세대를 규정하지 않아요 · 개인정보를 저장하지 않아요"
        />
      </body>
    </html>
  );
}
