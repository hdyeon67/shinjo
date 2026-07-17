import { Suspense } from "react";
import { QuizRunner } from "@/components/quiz/QuizRunner";

export const metadata = {
  title: "판독 중",
};

// 시작 시 랜덤 시드를 생성하므로 정적 프리렌더 금지 (?s= 없을 때 매번 새 문제).
export const dynamic = "force-dynamic";

export default function QuizPage() {
  return (
    <Suspense
      fallback={<div className="mx-auto max-w-md px-5 py-10 text-center text-ink-faint">불러오는 중…</div>}
    >
      <QuizRunner />
    </Suspense>
  );
}
