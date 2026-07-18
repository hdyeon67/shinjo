"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { generatePaper, newSeed, parseSeed, tierOf, TIER_LABELS } from "@/lib/shinjo-engine";
import { ITEMS } from "@/lib/content/items";
import { encodeResult } from "@/lib/share/encode";
import { track, durationBand } from "@/lib/analytics";

const CHOICE_MARK = ["①", "②", "③", "④"];

export function QuizRunner() {
  const router = useRouter();
  const params = useSearchParams();
  const nick = params.get("n") ?? params.get("nick") ?? undefined;
  const ageParam = params.get("age");
  const age = ageParam && /^\d{1,2}$/.test(ageParam) ? Number(ageParam) : undefined;

  // 시드 결정: ?s= 있으면 재현, 없으면 클라이언트에서 임의 생성 후 URL 에 심어 공유 가능하게.
  const sParam = params.get("s");
  const [seed, setSeed] = useState<number | null>(() => parseSeed(sParam));

  useEffect(() => {
    if (seed == null) {
      const ns = newSeed();
      const q = new URLSearchParams(params.toString());
      q.set("s", String(ns));
      router.replace(`/quiz?${q.toString()}`);
      setSeed(ns);
    }
  }, [seed, params, router]);

  const paper = useMemo(() => (seed == null ? null : generatePaper(ITEMS, seed)), [seed]);

  const total = paper?.items.length ?? 0;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const startedAt = useRef<number>(0);

  // 새 시험지(시드 확정)마다 진행상태를 처음부터 리셋.
  useEffect(() => {
    if (!paper) return;
    setIdx(0);
    setAnswers(Array(paper.items.length).fill(-1));
    startedAt.current = Date.now();
    track("quiz_start", {});
  }, [paper]);

  if (!paper || answers.length !== total) {
    return <div className="mx-auto max-w-md px-5 py-10 text-center text-ink-faint">문제 준비 중…</div>;
  }

  const item = paper.items[idx];
  const answered = answers.filter((a) => a >= 0).length;
  const progress = Math.round((idx / total) * 100);

  function choose(choiceIdx: number) {
    const next = answers.slice();
    next[idx] = choiceIdx;
    setAnswers(next);
    if (idx < total - 1) setIdx(idx + 1);
    else finish(next);
  }

  function finish(finalAnswers: number[]) {
    const seconds = startedAt.current ? (Date.now() - startedAt.current) / 1000 : 0;
    track("quiz_complete", { duration_band: durationBand(seconds) });
    const d = encodeResult({ seed: seed as number, answers: finalAnswers, age, nick });
    router.push(`/result?d=${d}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-6">
      {/* 진행 바 */}
      <div className="mb-1 flex items-center justify-between text-xs font-medium text-ink-soft">
        <button
          onClick={() => idx > 0 && setIdx(idx - 1)}
          disabled={idx === 0}
          className="disabled:opacity-30"
          aria-label="이전 문항"
        >
          ← 이전
        </button>
        <span className="pixel text-[11px]">
          {idx + 1} / {total}
        </span>
        <span className="text-ink-faint">언어 나이 판독</span>
      </div>
      <div className="bg-cloud-deep h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-candy h-full rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* 문항 */}
      <div key={idx} className="animate-fade-up mt-6 flex-1">
        <span className="bg-candy/15 text-candy-deep inline-block rounded-full px-3 py-1 text-xs font-bold">
          {TIER_LABELS[tierOf(item.eraYear)]} 신조어
        </span>

        <h2 className="mt-3 text-lg font-bold leading-snug text-ink">{item.question}</h2>

        <div className="mt-5 space-y-3">
          {item.choices.map((c, i) => {
            const selected = answers[idx] === i;
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                className={`flex w-full items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-[15px] transition active:translate-x-[1px] active:translate-y-[1px] ${
                  selected
                    ? "border-candy bg-candy/10 text-ink"
                    : "border-ink/12 hover:border-candy/50 bg-white text-ink"
                }`}
              >
                <span className={selected ? "text-candy-deep font-bold" : "text-ink-faint"}>
                  {CHOICE_MARK[i]}
                </span>
                <span>{c}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="text-ink-faint mt-6 text-center text-[11px]">
        답을 고르면 다음 문항으로 넘어가요 · 응답 {answered}/{total}
      </p>
    </main>
  );
}
