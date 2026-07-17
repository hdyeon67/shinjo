"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import type { GenerationKey } from "@/lib/shinjo-engine";

/** 결과 조회 계측 — 세대 구간(age_band)만 전송, 실제 나이는 절대 미전송. */
export function ResultTracker({ ageBand }: { ageBand: GenerationKey }) {
  useEffect(() => {
    track("result_view", { age_band: ageBand });
  }, [ageBand]);
  return null;
}
