// 튜닝 상수 — 출제 구성·언어 나이 델타·세대 구간·갭 밴드.
// 로직에서 분리해 여기 값만 고치면 판독 감도/커브를 조정할 수 있다.

import type { Direction, Generation, GenerationKey } from "./types";

/** 시험지 방향 구성: 최신 5 + 레트로 5 = 10문항 */
export const DIRECTION_RATIO: Record<Direction, number> = {
  new: 5,
  retro: 5,
};

/** 시험지 총 문항 수 (DIRECTION_RATIO 합) */
export const PAPER_SIZE = 10;

/** 언어 나이 계산의 기준(중립) 나이. 모든 문항 델타를 여기에 누적한다. */
export const BASE_AGE = 30;

/** 언어 나이 클램프 구간 */
export const AGE_MIN = 15;
export const AGE_MAX = 65;

/**
 * 최신 신조어 델타.
 * 맞히면 젊어지고(-), 최근 표현일수록 더 강하게 젊어진다(eraYear 가중).
 * 틀리면 늙어진다(+).
 */
export const NEW_CORRECT = -2; // 기본: 최신 신조어 정답 → 젊어짐
export const NEW_RECENT_YEAR = 2025; // 이 해 이후 표현이면 최신성 보너스
export const NEW_RECENT_BONUS = -1; // → 최신 표현 정답은 -3
export const NEW_WRONG = 2; // 최신 신조어 오답 → 늙어짐

/**
 * 레트로 유행어 델타.
 * 맞히면 늙어지고(+), 오래된 표현일수록 더 강하게 늙어진다(eraYear 가중).
 * 틀리면 젊어진다(-).
 */
export const RETRO_CORRECT = 2; // 기본: 레트로 정답 → 늙어짐
export const RETRO_OLD_YEAR = 2008; // 이 해 이전 표현이면 노장 보너스
export const RETRO_OLD_BONUS = 1; // → 올드 표현 정답 +3
export const RETRO_ANCIENT_YEAR = 2000; // 이 해 이전이면 추가 보너스(사전파 도달용)
export const RETRO_ANCIENT_BONUS = 1; // → 초기 인터넷/하이틴 표현 정답 최대 +4
export const RETRO_WRONG = -2; // 레트로 오답 → 젊어짐

/**
 * 세대 구간 — 언어 나이를 6개 라벨로 매핑.
 * 전 구간 유쾌·다정, 세대 비하 금지(늙은 결과도 "클래식 감성").
 * min~max 는 포함 구간이며 AGE_MIN~AGE_MAX 를 빈틈없이 덮는다.
 */
export const GENERATIONS: readonly Generation[] = [
  { min: 15, max: 19, key: "zalpha", label: "잘파어 원어민" },
  { min: 20, max: 29, key: "native", label: "신조어 네이티브" },
  { min: 30, max: 39, key: "bilingual", label: "밀레니얼 바이링구얼" },
  { min: 40, max: 49, key: "gyopo", label: "유행어 교포" },
  { min: 50, max: 59, key: "student", label: "언어 유학생" },
  { min: 60, max: 65, key: "purist", label: "사전파 순수주의자" },
] as const;

/** 세대 키 순서(문구 풀·집계용) */
export const GENERATION_KEYS: readonly GenerationKey[] = GENERATIONS.map((g) => g.key);

/**
 * 갭 크기 밴드 경계.
 * amount(=|실제-언어|) 0 → none, 1~4 → small, 5~14 → medium, 15+ → large.
 */
export const GAP_SMALL_MAX = 4;
export const GAP_MEDIUM_MAX = 14;
