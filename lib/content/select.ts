// 결과 문구 선택 로직 — 시드 기반 결정적 선택. 같은 (reading, seed) → 항상 같은 문구.

import { deriveIndex, type Gap, type Reading } from "@/lib/shinjo-engine";
import { GAP_COMMENTS, GAP_SAME, GENERATION_SUMMARIES } from "./copy";

/** 세대 총평 선택 */
export function selectGenerationSummary(reading: Reading, seed: number): string {
  const pool = GENERATION_SUMMARIES[reading.generation.key];
  return pool[deriveIndex(seed, `gen-${reading.generation.key}`, pool.length)];
}

/** 갭 코멘트 선택 (갭 없으면 null) */
export function selectGapComment(gap: Gap | null, seed: number): string | null {
  if (!gap) return null;
  if (gap.direction === "same" || gap.band === "none") {
    return GAP_SAME[deriveIndex(seed, "gap-same", GAP_SAME.length)];
  }
  const pool = GAP_COMMENTS[gap.direction][gap.band];
  return pool[deriveIndex(seed, `gap-${gap.direction}-${gap.band}`, pool.length)];
}

/** 결과 문구 한 벌 — 세대 총평 + (선택) 갭 코멘트 */
export interface ResultCopy {
  summary: string;
  gapComment: string | null;
}

export function buildResultCopy(reading: Reading, seed: number): ResultCopy {
  return {
    summary: selectGenerationSummary(reading, seed),
    gapComment: selectGapComment(reading.gap, seed),
  };
}
