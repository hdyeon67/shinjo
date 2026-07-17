// 시험지 생성 — 시드로부터 방향 비율 고정 추출 → 순서 셔플 → 선택지 셔플·정답 재매핑.
// 모든 단계가 결정적: 같은 (pool, seed) 는 항상 같은 Paper.
// "친구에게 같은 문제 도전시키기"가 공유 코어이므로 시드 결정성이 제품의 핵심이다.

import { fnv1a, seededSample, seededShuffle } from "./hash";
import { DIRECTION_RATIO } from "./constants";
import { DIRECTIONS, type Direction, type Item, type Paper, type ShuffledItem } from "./types";

/**
 * 응시 시작 시 임의 시드를 생성한다(?s= 로 URL 에 실려 공유·재현된다).
 * Math.random 은 앱 계층에서만 호출되며 엔진 로직 자체는 결정적으로 유지된다.
 * 32bit 부호 없는 정수 범위로 정규화.
 */
export function newSeed(rand: () => number = Math.random): number {
  return Math.floor(rand() * 0xffffffff) >>> 0;
}

/**
 * ?s= 로 들어온 문자열/숫자를 안전한 시드 정수로 정규화.
 * 순수 숫자면 그대로, 아니면 해시. 유효하지 않으면 null.
 */
export function parseSeed(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const s = String(raw).trim();
  if (s === "") return null;
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    if (Number.isFinite(n)) return n >>> 0;
  }
  return fnv1a(s);
}

/** pool 을 방향별로 그룹화 */
function groupByDirection(pool: readonly Item[]): Record<Direction, Item[]> {
  const groups = { new: [], retro: [] } as Record<Direction, Item[]>;
  for (const item of pool) groups[item.direction].push(item);
  return groups;
}

/**
 * 문항의 선택지를 (시험지 시드 + 문항 id)로 결정적 셔플하고 정답 위치를 재매핑.
 * 인덱스 순열을 셔플해 적용하므로 선택지 텍스트가 중복돼도 정답 추적이 정확하다.
 * 같은 시드에는 모든 사용자가 같은 선택지 순서를 본다.
 */
function shuffleChoices(item: Item, paperSeed: number): ShuffledItem {
  const choiceSeed = fnv1a(`${paperSeed}|${item.id}`);
  const perm = seededShuffle(
    item.choices.map((_, i) => i),
    choiceSeed,
  );
  const choices = perm.map((origIdx) => item.choices[origIdx]);
  const answerIndex = perm.indexOf(item.answerIndex);
  return { ...item, choices, answerIndex };
}

/**
 * 시험지 생성.
 * 1) 방향별로 DIRECTION_RATIO 만큼 비복원 추출(방향마다 파생 시드가 달라 상관 없음)
 * 2) 뽑힌 문항 순서를 셔플
 * 3) 각 문항의 선택지 셔플 + answerIndex 재매핑
 */
export function generatePaper(pool: readonly Item[], seed: number): Paper {
  const groups = groupByDirection(pool);

  // 1) 방향 비율 고정 추출 (DIRECTIONS 순서)
  const selected: Item[] = [];
  for (const dir of DIRECTIONS) {
    const dirSeed = fnv1a(`${seed}|dir|${dir}`);
    selected.push(...seededSample(groups[dir], DIRECTION_RATIO[dir], dirSeed));
  }

  // 2) 문항 순서 셔플
  const ordered = seededShuffle(selected, fnv1a(`${seed}|order`));

  // 3) 선택지 셔플 + 정답 재매핑
  const items = ordered.map((item) => shuffleChoices(item, seed));

  return { seed, items };
}
