import { StartCard } from "@/components/landing/StartCard";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-[85vh] max-w-md flex-col items-center justify-center px-5 py-10">
      <div className="mb-7 text-center">
        <p className="text-grape-deep text-sm font-bold tracking-wide">요즘 밈으로 판독하는 나의 언어 나이</p>
        <h1 className="mt-2 text-4xl font-black leading-tight text-ink">
          신조어 판독기
        </h1>
        <p className="text-ink-soft mt-3 text-[15px] leading-relaxed">
          10문항으로 판독하는 나의 <b className="text-candy-deep">언어 나이</b>.
          <br />
          잘파어 원어민일까, 신조어 무풍지대일까?
        </p>
      </div>

      <StartCard />

      <ul className="text-ink-faint mt-6 space-y-1 text-center text-xs leading-relaxed">
        <li>· 같은 링크는 항상 같은 문제 → 친구에게 도전장</li>
        <li>· 언어 나이 카드로 결과 공유·대결</li>
        <li>· 이름·생일 없이 바로 판독 (실제 나이는 선택)</li>
      </ul>

      <p className="text-ink-faint/80 mt-6 text-center text-[11px]">
        재미·참고용 진단입니다 · 언어 능력이나 세대를 규정하지 않아요
      </p>
    </main>
  );
}
