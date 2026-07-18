import type { Gap, Reading } from "@/lib/shinjo-engine";
import type { ResultCopy } from "@/lib/content/select";

/** 갭 한 줄 문구 ("몸은 32세, 언어는 19세") */
function gapLine(gap: Gap): string {
  if (gap.direction === "same") return `몸도 언어도 ${gap.realAge}세 · 완벽 일치`;
  return `몸은 ${gap.realAge}세, 언어는 ${gap.realAge - (gap.direction === "younger" ? gap.amount : -gap.amount)}세`;
}

/**
 * 결과 히어로 — "언어 나이" 숫자가 주인공인 Y2K 카드.
 * PNG 저장(Phase 4) 대상이므로 id="age-card" 를 유지한다.
 */
export function LanguageAgeCard({
  name,
  reading,
  copy,
}: {
  name: string;
  reading: Reading;
  copy: ResultCopy;
}) {
  const { languageAge, generation, gap, totalCorrect, total } = reading;

  return (
    <div id="age-card" className="y2k-card relative overflow-hidden px-6 py-8 text-center">
      {/* 반짝이 데코 */}
      <span className="animate-twinkle text-lemon absolute left-4 top-4 text-xl">✦</span>
      <span className="animate-twinkle text-candy absolute right-5 top-6 text-sm" style={{ animationDelay: "0.4s" }}>
        ✦
      </span>
      <span className="animate-twinkle text-grape absolute bottom-6 left-6 text-base" style={{ animationDelay: "0.9s" }}>
        ✦
      </span>

      <p className="text-ink-soft text-xs font-bold">
        {name} 님의 언어 나이
      </p>

      <div className="animate-pop-in mt-1 flex items-end justify-center gap-1">
        <span className="pixel text-ink text-[64px] leading-none drop-shadow-[3px_3px_0_rgba(255,255,255,0.8)]">
          {languageAge}
        </span>
        <span className="text-ink-soft mb-2 text-2xl font-black">세</span>
      </div>

      <div className="mt-3 inline-block rounded-full border-2 border-ink bg-white px-4 py-1.5 text-sm font-black text-ink shadow-popsm">
        {generation.label}
      </div>

      {gap && (
        <p className="text-ink-soft mt-3 text-[13px] font-semibold">🪞 {gapLine(gap)}</p>
      )}

      <p className="text-ink mt-4 text-[14px] font-medium leading-relaxed">{copy.summary}</p>
      {copy.gapComment && (
        <p className="text-ink-soft mt-1.5 text-[13px] leading-relaxed">{copy.gapComment}</p>
      )}

      <div className="text-ink-soft mt-5 flex justify-center text-xs font-bold">
        <span className="bg-candy/15 text-candy-deep rounded-lg px-4 py-1.5">
          최신 신조어 {totalCorrect}/{total} 적중
        </span>
      </div>

      <p className="text-ink-faint mt-5 text-[10px]">
        신조어 판독기 · shinjo.fineboll.com · 재미용 진단
      </p>
    </div>
  );
}
