// Phase 1 테스트용 합성 픽스처 풀.
// 실제 40+ 문항(Phase 2)은 별도 데이터로 교체한다.
// - 방향별 12문항(총 24) → 5/5 추출에 충분
// - 정답 위치를 일부러 편향(대부분 ②=index 1)시켜, 선택지 셔플이 쏠림을 무력화하는지 검증
// - 최신은 eraYear 2025(최신성 보너스), 레트로는 1999(노장+초기 보너스)로 고정해
//   극단 답안이 나이 구간의 양끝(15 / 60)에 도달하는지 결정적으로 검증

import { DIRECTIONS, type Direction, type Item } from "../types";

const PER_DIRECTION = 12;

function makeItem(direction: Direction, n: number): Item {
  const id = `${direction}-${String(n).padStart(2, "0")}`;
  // 편향: 대부분 정답을 index 1 로, 일부만 다른 위치로 → 원본 데이터 쏠림 재현
  const answerIndex = n % 4 === 0 ? 3 : 1;
  const eraYear = direction === "new" ? 2025 : 1999;
  return {
    id,
    direction,
    question: `${id} 질문`,
    choices: [`${id}-c0`, `${id}-c1`, `${id}-c2`, `${id}-c3`],
    answerIndex,
    eraYear,
    explain: `${id} 해설`,
  };
}

/** 24문항 합성 풀 */
export const FIXTURE_POOL: Item[] = DIRECTIONS.flatMap((direction) =>
  Array.from({ length: PER_DIRECTION }, (_, i) => makeItem(direction, i + 1)),
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
