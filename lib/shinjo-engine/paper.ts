// 시험지 생성 (v2) — 시드로 티어별 추출(부족하면 백필) → 순서 셔플 → 선택지 셔플·정답 재매핑.
// 모든 단계가 결정적: 같은 (pool, seed) 는 항상 같은 Paper.
// "친구에게 같은 문제 도전시키기"가 공유 코어이므로 시드 결정성이 제품의 핵심이다.

import { fnv1a, seededSample, seededShuffle } from "./hash";
import { PAPER_SIZE, TIER_TARGET } from "./constants";
import { TIERS, tierOf, type Item, type Paper, type ShuffledItem, type Tier } from "./types";

/** 응시 시작 시 임의 시드 생성(?s= 로 URL 에 실려 공유·재현). 32bit 부호 없는 정수. */
export function newSeed(rand: () => number = Math.random): number {
  return Math.floor(rand() * 0xffffffff) >>> 0;
}

/** ?s= 문자열/숫자를 안전한 시드 정수로 정규화. 유효하지 않으면 null. */
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

/** pool 을 티어별로 그룹화 */
function groupByTier(pool: readonly Item[]): Record<Tier, Item[]> {
  const groups = { A: [], B: [], C: [], D: [] } as Record<Tier, Item[]>;
  for (const item of pool) groups[tierOf(item.eraYear)].push(item);
  return groups;
}

/** 선택지를 (시험지 시드 + 문항 id)로 결정적 셔플하고 정답 위치를 재매핑. */
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
 * 1) 티어별로 TIER_TARGET 만큼 비복원 추출(티어마다 파생 시드가 달라 상관 없음)
 * 2) 목표에 못 미치면(티어 A가 비어있는 등) 남은 문항에서 최신 티어 우선으로 백필해 10문항 채움
 * 3) 문항 순서 셔플 → 각 문항 선택지 셔플 + answerIndex 재매핑
 */
export function generatePaper(pool: readonly Item[], seed: number): Paper {
  const groups = groupByTier(pool);

  const selected: Item[] = [];
  const usedIds = new Set<string>();

  // 1) 티어 비율 고정 추출
  for (const tier of TIERS) {
    const tierSeed = fnv1a(`${seed}|tier|${tier}`);
    for (const it of seededSample(groups[tier], TIER_TARGET[tier], tierSeed)) {
      selected.push(it);
      usedIds.add(it.id);
    }
  }

  // 2) 백필 — 부족분을 남은 문항(최신 티어 우선)에서 채워 PAPER_SIZE 도달
  if (selected.length < PAPER_SIZE) {
    const remaining: Item[] = [];
    for (const tier of TIERS) {
      for (const it of groups[tier]) if (!usedIds.has(it.id)) remaining.push(it);
    }
    const need = PAPER_SIZE - selected.length;
    for (const it of seededSample(remaining, need, fnv1a(`${seed}|backfill`))) {
      selected.push(it);
      usedIds.add(it.id);
    }
  }

  // 3) 문항 순서 셔플 + 선택지 셔플
  const ordered = seededShuffle(selected, fnv1a(`${seed}|order`));
  const items = ordered.map((item) => shuffleChoices(item, seed));

  return { seed, items };
}
