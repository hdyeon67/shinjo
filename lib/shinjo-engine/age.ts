// 언어 나이 판독 (v2) — "놓친 최신성만큼 나이가 붙는다".
// AGE_BASE(15)에서 시작해 오답마다 그 문항 티어의 MISS_PENALTY 를 더하고 15~40 클램프.
// 전부 결정적: 같은 (paper, answers) 는 항상 같은 Reading. 같은 답안 → 항상 같은 나이.

import {
  AGE_BASE,
  AGE_MAX,
  AGE_MIN,
  GAP_MEDIUM_MAX,
  GAP_SMALL_MAX,
  GENERATIONS,
  MISS_PENALTY,
} from "./constants";
import { TIERS, tierOf, type Gap, type Generation, type Paper, type Reading, type Tier } from "./types";

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** 언어 나이가 속하는 세대 구간 (경계 밖이면 양끝으로 수렴) */
export function generationFor(languageAge: number): Generation {
  for (const g of GENERATIONS) {
    if (languageAge >= g.min && languageAge <= g.max) return g;
  }
  return languageAge < GENERATIONS[0].min ? GENERATIONS[0] : GENERATIONS[GENERATIONS.length - 1];
}

/** 실제 나이 대비 갭 계산 */
export function gapFor(realAge: number, languageAge: number): Gap {
  const amount = Math.abs(realAge - languageAge);
  const direction = languageAge < realAge ? "younger" : languageAge > realAge ? "older" : "same";
  const band =
    amount === 0
      ? "none"
      : amount <= GAP_SMALL_MAX
        ? "small"
        : amount <= GAP_MEDIUM_MAX
          ? "medium"
          : "large";
  return { realAge, amount, direction, band };
}

/**
 * 시험지 판독.
 * @param answers 각 문항에 고른 선택지 인덱스(미응답은 -1 또는 범위 밖 값 → 오답 처리)
 * @param realAge 실제 나이(선택). 유효한 양의 정수일 때만 갭을 계산한다.
 */
export function read(paper: Paper, answers: readonly number[], realAge?: number | null): Reading {
  let rawAge = AGE_BASE;
  let totalCorrect = 0;

  const acc: Record<Tier, { correct: number; total: number }> = {
    A: { correct: 0, total: 0 },
    B: { correct: 0, total: 0 },
    C: { correct: 0, total: 0 },
    D: { correct: 0, total: 0 },
  };

  paper.items.forEach((item, i) => {
    const tier = tierOf(item.eraYear);
    acc[tier].total += 1;
    const correct = answers[i] === item.answerIndex;
    if (correct) {
      totalCorrect += 1;
      acc[tier].correct += 1;
    } else {
      // 오답 → 놓친 표현의 최신성만큼 나이가 붙는다
      rawAge += MISS_PENALTY[tier];
    }
  });

  const languageAge = clamp(Math.round(rawAge), AGE_MIN, AGE_MAX);
  const generation = generationFor(languageAge);

  const validReal = typeof realAge === "number" && Number.isFinite(realAge) && realAge > 0;
  const gap = validReal ? gapFor(Math.round(realAge as number), languageAge) : null;

  return {
    languageAge,
    rawAge,
    generation,
    totalCorrect,
    total: paper.items.length,
    tierScores: TIERS.map((tier) => ({ tier, correct: acc[tier].correct, total: acc[tier].total })),
    gap,
  };
}
