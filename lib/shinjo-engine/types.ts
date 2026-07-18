// shinjo-engine 도메인 타입 (v2: 최신 신조어 전용)
// 프레임워크 무의존. 출제/판독 전 과정이 이 타입 위에서 결정적으로 동작한다.
// v1의 레트로 유행어(direction) 개념은 제거되고, 신조어의 최신성(eraYear→Tier)으로 판독한다.

/** 신조어 세대 티어 — 유행 시작 연도 기준 최신성 */
export type Tier = "A" | "B" | "C" | "D";

/** 티어 순서(출제 비율·집계 기준) — A 최신 → D 1세대 */
export const TIERS: readonly Tier[] = ["A", "B", "C", "D"] as const;

/** 티어 한글 라벨 (UI·해설용) */
export const TIER_LABELS: Record<Tier, string> = {
  A: "최신",
  B: "요즘",
  C: "정착",
  D: "1세대",
};

/**
 * eraYear(유행 시작 연도)를 티어로 변환.
 * A 최신 2025~ / B 2023~24 / C 2021~22 / D 1세대 ~2020
 */
export function tierOf(eraYear: number): Tier {
  if (eraYear >= 2025) return "A";
  if (eraYear >= 2023) return "B";
  if (eraYear >= 2021) return "C";
  return "D";
}

/**
 * 문항 원본 스키마 (문항 풀 데이터). 전부 최신 신조어.
 * choices 는 원본 순서, answerIndex 는 그 순서 기준 0-based 정답 위치.
 * eraYear 는 그 표현이 유행하기 시작한 대략 연도(언어 나이 판독의 핵심).
 */
export interface Item {
  id: string;
  question: string;
  choices: string[]; // 4지선다
  answerIndex: number; // 0-based
  /** 표현이 유행하기 시작한 대략 연도. 예: 2024 */
  eraYear: number;
  /** 해설 1문장 (유래·의미 재미) */
  explain: string;
}

/**
 * 시험지에 실린 문항 — 선택지가 (시험지 시드 + 문항 id)로 결정적 셔플되고
 * answerIndex 가 셔플된 위치로 재매핑된 상태.
 */
export interface ShuffledItem extends Item {
  choices: string[];
  answerIndex: number;
}

/** 생성된 시험지 */
export interface Paper {
  seed: number;
  items: ShuffledItem[]; // 10문항, 순서까지 확정
}

/** 세대 구간 (언어 나이 → 라벨) */
export interface Generation {
  /** 구간 하한(포함) */
  min: number;
  /** 구간 상한(포함) */
  max: number;
  key: GenerationKey;
  label: string;
}

export type GenerationKey =
  | "zalpha" // 15~18 잘파어 원어민
  | "native" // 19~22 신조어 네이티브
  | "life" // 23~27 신조어 생활파
  | "immigrant" // 28~31 신조어 이민자
  | "observer" // 32~36 신조어 관망러
  | "windless"; // 37~40 신조어 무풍지대

/** 갭 방향 — 언어 나이가 실제 나이보다 어린지/많은지 */
export type GapDirection = "younger" | "older" | "same";

/** 갭 크기 구간 */
export type GapBand = "none" | "small" | "medium" | "large";

/** 실제 나이 대비 갭 결과 */
export interface Gap {
  realAge: number;
  amount: number;
  direction: GapDirection;
  band: GapBand;
}

/** 판독 결과 */
export interface Reading {
  /** 최종 언어 나이 (AGE_MIN~AGE_MAX 로 클램프) */
  languageAge: number;
  /** 클램프 전 원점수(디버그·튜닝용) */
  rawAge: number;
  generation: Generation;
  /** 총 정답 수 (0~10) */
  totalCorrect: number;
  /** 총 문항 수 */
  total: number;
  /** 티어별 (정답/출제) 집계 */
  tierScores: { tier: Tier; correct: number; total: number }[];
  /** 실제 나이를 입력했을 때만 채워지는 갭 (없으면 null) */
  gap: Gap | null;
}
