// 튜닝 상수 (v2) — 티어 출제·언어 나이 델타·세대 구간·갭 밴드.
// 로직에서 분리해 여기 값만 고치면 감도/커브를 조정할 수 있다.

import type { Generation, GenerationKey, Tier } from "./types";

/** 시험지 티어 구성: A2·B3·C3·D2 = 10문항 (최신 위주 가중). 티어가 부족하면 백필. */
export const TIER_TARGET: Record<Tier, number> = {
  A: 2,
  B: 3,
  C: 3,
  D: 2,
};

/** 시험지 총 문항 수 */
export const PAPER_SIZE = 10;

/** 언어 나이 시작(가장 어림) — 전부 정답이면 여기(15세). */
export const AGE_BASE = 15;

/** 언어 나이 클램프 구간 (v2: 15~40) */
export const AGE_MIN = 15;
export const AGE_MAX = 40;

/**
 * 오답 시 나이 가산 — 놓친 표현이 최신일수록 더 많이 늙는다.
 * 정답은 +0. A(최신) 놓침이 가장 크고 D(1세대)가 가장 작다.
 * A2·B3·C3·D2 전부 오답 ≈ 2*3.0+3*2.7+3*2.4+2*2.1 = 25.5 → 15+25.5 = 40.5 → clamp 40.
 */
export const MISS_PENALTY: Record<Tier, number> = {
  A: 3.0,
  B: 2.7,
  C: 2.4,
  D: 2.1,
};

/**
 * 세대 구간 — 언어 나이(15~40)를 6개 라벨로 매핑.
 * 신조어 유창성 기준. 전 구간 유쾌·다정, 비하 금지(무풍지대도 "클래식 감성").
 * min~max 포함 구간이며 15~40 을 빈틈없이 덮는다.
 */
export const GENERATIONS: readonly Generation[] = [
  { min: 15, max: 18, key: "zalpha", label: "잘파어 원어민" },
  { min: 19, max: 22, key: "native", label: "신조어 네이티브" },
  { min: 23, max: 27, key: "life", label: "신조어 생활파" },
  { min: 28, max: 31, key: "immigrant", label: "신조어 이민자" },
  { min: 32, max: 36, key: "observer", label: "신조어 관망러" },
  { min: 37, max: 40, key: "windless", label: "신조어 무풍지대" },
] as const;

/** 세대 키 순서(문구 풀·집계용) */
export const GENERATION_KEYS: readonly GenerationKey[] = GENERATIONS.map((g) => g.key);

/**
 * 갭 크기 밴드 경계.
 * amount(=|실제-언어|) 0 → none, 1~4 → small, 5~14 → medium, 15+ → large.
 */
export const GAP_SMALL_MAX = 4;
export const GAP_MEDIUM_MAX = 14;
