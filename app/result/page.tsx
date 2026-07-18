import type { Metadata } from "next";
import Link from "next/link";
import { generatePaper, read } from "@/lib/shinjo-engine";
import { ITEMS } from "@/lib/content/items";
import { buildResultCopy } from "@/lib/content/select";
import { decodeResult } from "@/lib/share/encode";
import { LanguageAgeCard } from "@/components/result/LanguageAgeCard";
import { WrongAnswers, type ReviewItem } from "@/components/result/WrongAnswers";
import { ResultActions } from "@/components/result/ResultActions";
import { ResultTracker } from "@/components/result/ResultTracker";
import { CrossPromo } from "@/components/CrossPromo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const payload = d ? decodeResult(d) : null;

  // 결과는 개인 응답 기반이라 색인 제외. OG 이미지는 Phase 4(/api/og)에서 연결.
  const base: Metadata = { title: "언어 나이 판독 결과", robots: { index: false, follow: true } };
  if (!payload) return base;

  const reading = read(generatePaper(ITEMS, payload.seed), payload.answers, payload.age);
  const title = `내 언어 나이 ${reading.languageAge}세 · ${reading.generation.label}`;
  const description = "신조어 판독기로 내 언어 나이 확인 · 친구랑 같은 문제로 대결해요.";
  const ogImage = `/api/og?d=${encodeURIComponent(d as string)}`;
  return {
    ...base,
    title,
    description,
    openGraph: { title, description, images: [{ url: ogImage, width: 600, height: 315 }] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage] },
  };
}

export default async function ResultPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const payload = d ? decodeResult(d) : null;

  if (!payload) {
    return (
      <main className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-5 text-center">
        <p className="text-lg font-bold text-ink">결과를 불러올 수 없어요</p>
        <p className="text-ink-soft mt-2 text-sm">링크가 손상되었거나 만료된 형식이에요.</p>
        <Link
          href="/"
          className="bg-candy mt-6 rounded-xl border-2 border-ink px-6 py-3 font-bold text-white shadow-popsm"
        >
          다시 판독하러 가기
        </Link>
      </main>
    );
  }

  const paper = generatePaper(ITEMS, payload.seed);
  const reading = read(paper, payload.answers, payload.age);
  const copy = buildResultCopy(reading, payload.seed);
  const name = payload.nick?.trim() || "언어탐정";
  const shareTitle = `내 언어 나이 ${reading.languageAge}세 · ${reading.generation.label}`;
  const shareDesc = "너의 언어 나이는? 같은 문제로 판독 대결 ⚔️";

  const review: ReviewItem[] = paper.items.map((it, i) => ({
    direction: it.direction,
    question: it.question,
    choices: it.choices,
    correctIndex: it.answerIndex,
    userIndex: payload.answers[i] ?? -1,
    eraYear: it.eraYear,
    explain: it.explain,
  }));

  return (
    <main className="mx-auto max-w-md px-5 py-8">
      <ResultTracker ageBand={reading.generation.key} />

      <div className="animate-fade-up">
        <LanguageAgeCard name={name} reading={reading} copy={copy} />
      </div>

      <ResultActions seed={payload.seed} shareTitle={shareTitle} shareDesc={shareDesc} />

      <WrongAnswers items={review} />

      <div className="mt-8">
        <CrossPromo />
      </div>

      <p className="text-ink-faint/80 mt-8 text-center text-[11px] leading-relaxed">
        재미·참고용 진단 · 언어 능력이나 세대를 규정하지 않아요
        <br />
        개인정보는 저장하지 않으며, 결과는 링크 안에만 담겨요
      </p>
    </main>
  );
}
