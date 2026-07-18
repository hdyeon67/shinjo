import { tierOf, TIER_LABELS } from "@/lib/shinjo-engine";

export interface ReviewItem {
  question: string;
  choices: string[];
  correctIndex: number;
  userIndex: number;
  eraYear: number;
  explain: string;
}

/** 문항별 정오답 + 유래 해설. 지식 재미 포인트("이 말은 2002년…"). */
export function WrongAnswers({ items }: { items: ReviewItem[] }) {
  const wrongCount = items.filter((it) => it.userIndex !== it.correctIndex).length;

  return (
    <section className="mt-8">
      <h2 className="text-ink text-base font-black">
        📖 문항 풀이 {wrongCount > 0 ? `· 틀린 ${wrongCount}문항 포함` : "· 전부 정답!"}
      </h2>
      <p className="text-ink-faint mt-1 text-xs">유행어의 유래를 알면 언어 나이는 저절로 올라가요.</p>

      <ul className="mt-4 space-y-3">
        {items.map((it, i) => {
          const correct = it.userIndex === it.correctIndex;
          return (
            <li key={i} className="sticker p-4 text-left">
              <div className="flex items-center justify-between">
                <span className="bg-candy/15 text-candy-deep rounded-full px-2.5 py-0.5 text-[11px] font-bold">
                  {TIER_LABELS[tierOf(it.eraYear)]} 신조어 · {it.eraYear}
                </span>
                <span className={`text-sm font-black ${correct ? "text-aqua-deep" : "text-candy-deep"}`}>
                  {correct ? "정답 ✅" : "오답 ❌"}
                </span>
              </div>

              <p className="text-ink mt-2 text-sm font-bold leading-snug">{it.question}</p>

              <p className="text-ink-soft mt-2 text-[13px]">
                정답: <b className="text-ink">{it.choices[it.correctIndex]}</b>
                {!correct && it.userIndex >= 0 && (
                  <span className="text-ink-faint"> · 내 답: {it.choices[it.userIndex]}</span>
                )}
                {!correct && it.userIndex < 0 && <span className="text-ink-faint"> · 미응답</span>}
              </p>

              <p className="text-ink-soft mt-1.5 text-[12px] leading-relaxed">💡 {it.explain}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
