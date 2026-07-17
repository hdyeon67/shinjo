"use client";

import { AdFit } from "./AdFit";
import { ADFIT_UNIT_MOBILE } from "@/lib/config/flags";

/**
 * 인라인 광고 슬롯 (모바일 가로 배너 320×100).
 * 기획: 결과·가이드 페이지에만 최대 2슬롯. 랜딩·응시("/quiz")에는 노출하지 않는다.
 * 단위 ID(env)가 없으면 렌더하지 않는다(빈 슬롯 방지 → 애드센스 정책·UX 보호).
 */
export function AdSlot({ className = "" }: { className?: string }) {
  if (!ADFIT_UNIT_MOBILE) return null;
  return (
    <div className={`my-6 flex justify-center ${className}`}>
      <AdFit unit={ADFIT_UNIT_MOBILE} width={320} height={100} />
    </div>
  );
}
