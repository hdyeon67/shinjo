// 언어 나이 판독 — 답안으로부터 델타 누적 → 클램프 → 세대 라벨 → (선택) 실제 나이 갭.
// 전부 결정적: 같은 (paper, answers) 는 항상 같은 Reading. 같은 답안 → 항상 같은 나이.

import {
  AGE_MAX,
  AGE_MIN,
  BASE_AGE,
  GAP_MEDIUM_MAX,
  GAP_SMALL_MAX,
  GENERATIONS,
  NEW_CORRECT,
  NEW_RECENT_BONUS,
  NEW_RECENT_YEAR,
  NEW_WRONG,
  RETRO_ANCIENT_BONUS,
  RETRO_ANCIENT_YEAR,
  RETRO_CORRECT,
  RETRO_OLD_BONUS,
  RETRO_OLD_YEAR,
  RETRO_WRONG,
} from "./constants";
import type { Gap, Generation, Item, Paper, Reading } from "./types";

/** [lo, hi] 로 클램프 */
function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * 문항 하나가 언어 나이에 주는 델타.
 * - 최신 신조어: 정답이면 젊어지고(최근 표현일수록 강함), 오답이면 늙어진다.
 * - 레트로 유행어: 정답이면 늙어지고(오래된 표현일수록 강함), 오답이면 젊어진다.
 */
export function itemDelta(item: Item, correct: boolean): number {
  if (item.direction === "new") {
    if (!correct) return NEW_WRONG;
    const recent = item.eraYear >= NEW_RECENT_YEAR ? NEW_RECENT_BONUS : 0;
    return NEW_CORRECT + recent;
  }
  // retro
  if (!correct) return RETRO_WRONG;
  const old = item.eraYear <= RETRO_OLD_YEAR ? RETRO_OLD_BONUS : 0;
  const ancient = item.eraYear <= RETRO_ANCIENT_YEAR ? RETRO_ANCIENT_BONUS : 0;
  return RETRO_CORRECT + old + ancient;
}

/** 언어 나이가 속하는 세대 구간 (경계 밖이면 양끝 구간으로 수렴) */
export function generationFor(languageAge: number): Generation {
  for (const g of GENERATIONS) {
    if (languageAge >= g.min && languageAge <= g.max) return g;
  }
  // AGE_MIN~AGE_MAX 를 GENERATIONS 가 빈틈없이 덮으므로 방어적 반환
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
 * @param answers 각 문항에 고른 선택지 인덱스(미응답은 -1 또는 범위 밖 값)
 * @param realAge 실제 나이(선택). 유효한 양의 정수일 때만 갭을 계산한다.
 */
export function read(paper: Paper, answers: readonly number[], realAge?: number | null): Reading {
  let rawAge = BASE_AGE;
  let newCorrect = 0;
  let retroCorrect = 0;

  paper.items.forEach((item, i) => {
    const correct = answers[i] === item.answerIndex;
    rawAge += itemDelta(item, correct);
    if (correct) {
      if (item.direction === "new") newCorrect += 1;
      else retroCorrect += 1;
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
    newCorrect,
    retroCorrect,
    totalCorrect: newCorrect + retroCorrect,
    gap,
  };
}
