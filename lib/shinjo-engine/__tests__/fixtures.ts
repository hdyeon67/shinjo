// Phase/v2 테스트용 합성 픽스처 풀 (전부 최신 신조어, 티어 A~D).
// 정답 위치를 일부러 편향(대부분 ②=index 1)시켜 선택지 셔플이 쏠림을 무력화하는지 검증.

import type { Item } from "../types";

// 티어별 대표 eraYear: A 2026 / B 2024 / C 2022 / D 2019
const TIER_YEARS = [2026, 2024, 2022, 2019];
const PER_YEAR = 6; // 티어당 6문항 → 총 24 (A2·B3·C3·D2 출제에 충분)

function makeItem(eraYear: number, n: number): Item {
  const id = `${eraYear}-${String(n).padStart(2, "0")}`;
  const answerIndex = n % 4 === 0 ? 3 : 1; // 편향
  return {
    id,
    question: `${id} 질문`,
    choices: [`${id}-c0`, `${id}-c1`, `${id}-c2`, `${id}-c3`],
    answerIndex,
    eraYear,
    explain: `${id} 해설`,
  };
}

/** 24문항 합성 풀 (티어 A~D 각 6) */
export const FIXTURE_POOL: Item[] = TIER_YEARS.flatMap((y) =>
  Array.from({ length: PER_YEAR }, (_, i) => makeItem(y, i + 1)),
);

/** 결정적 와이드 시드 표본 (플래키 방지 — Math.random 미사용) */
export function sampleSeeds(): number[] {
  const seeds: number[] = [];
  for (let a = 0; a < 40; a++) {
    for (let b = 0; b < 10; b++) {
      seeds.push(a * 7919 + b * 104729 + 12345);
    }
  }
  return seeds;
}

/** 시험지 전 문항을 정답으로 채운 답안 */
export function allCorrect(items: { answerIndex: number }[]): number[] {
  return items.map((it) => it.answerIndex);
}

/** 시험지 전 문항을 오답으로 채운 답안 (정답이 아닌 첫 인덱스) */
export function allWrong(items: { answerIndex: number }[]): number[] {
  return items.map((it) => (it.answerIndex === 0 ? 1 : 0));
}
