import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/content/guides";

export const metadata: Metadata = {
  title: "신조어 판독 가이드",
  description:
    "신조어 모음, 신조어 테스트 — 요즘 말을 읽고 내 언어 나이를 판독해 보세요.",
};

export default function GuideIndex() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <header className="mb-6">
        <Link href="/" className="text-ink-faint text-sm">
          ← 홈으로
        </Link>
        <h1 className="mt-3 text-3xl font-black text-ink">신조어 판독 가이드</h1>
        <p className="text-ink-soft mt-2 text-[15px] leading-relaxed">
          요즘 말과 그 시절 유행어를 읽고, 신조어 판독기로 내 언어 나이를 확인해 보세요.
        </p>
      </header>

      <div className="space-y-2.5">
        {GUIDES.map((g) => (
          <Link
            key={g.slug}
            href={`/guide/${g.slug}`}
            className="border-cloud-deep hover:border-candy/50 flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-4 transition"
          >
            <span className="bg-candy/10 flex size-10 items-center justify-center rounded-lg text-xl">
              {g.emoji}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold text-ink">{g.keyword}</span>
              <span className="text-ink-faint block truncate text-xs">{g.metaTitle}</span>
            </span>
            <span className="text-ink-faint" aria-hidden>
              ›
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
