"use client";

import { usePathname } from "next/navigation";
import { AdFit } from "./AdFit";
import { ADFIT_UNIT_PC_LEFT, ADFIT_UNIT_PC_RIGHT } from "@/lib/config/flags";

/** 광고를 노출할 경로: 결과·가이드만 (랜딩·응시·about·privacy 제외). */
function adAllowed(pathname: string): boolean {
  return pathname === "/result" || pathname === "/guide" || pathname.startsWith("/guide/");
}

/**
 * PC 좌·우 세로 사이드 광고(160×600). xl(1280px) 이상에서만 노출.
 * 기획: 결과·가이드 페이지에서만. 단위 ID(env)가 없으면 렌더하지 않는다.
 */
export function AdRails() {
  const pathname = usePathname();
  if (!adAllowed(pathname)) return null;
  if (!ADFIT_UNIT_PC_LEFT && !ADFIT_UNIT_PC_RIGHT) return null;
  return (
    <>
      <div className="pointer-events-none fixed inset-y-0 left-0 z-30 hidden items-center pl-3 xl:flex">
        <div className="pointer-events-auto">
          <AdFit unit={ADFIT_UNIT_PC_LEFT} width={160} height={600} />
        </div>
      </div>
      <div className="pointer-events-none fixed inset-y-0 right-0 z-30 hidden items-center pr-3 xl:flex">
        <div className="pointer-events-auto">
          <AdFit unit={ADFIT_UNIT_PC_RIGHT} width={160} height={600} />
        </div>
      </div>
    </>
  );
}
