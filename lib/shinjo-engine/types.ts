// shinjo-engine 도메인 타입
// 프레임워크 무의존. 출제/판독 전 과정이 이 타입 위에서 결정적으로 동작한다.

/** 문항 방향 — 최신 신조어 vs 레트로 유행어 */
export type Direction = "new" | "retro";

/** 방향 순서(출제·집계의 기준 순서) */
export const DIRECTIONS: readonly Direction[] = ["new", "retro"] as const;

/** 방향 한글 라벨 (UI용) */
export const DIRECTION_LABELS: Record<Direction, string> = {
  new: "최신 신조어",
  retro: "레트로 유행어",
};

/**
 * 문항 원본 스키마 (문항 풀 데이터).
 * choices 는 원본 순서, answerIndex 는 그 순서 기준 0-based 정답 위치.
 * eraYear 는 그 표현이 유행한 대략 연도(신조어 판독의 가중 기준).
 */
export interface Item {
  id: string;
  direction: Direction;
  question: string;
  choices: string[]; // 4지선다
  answerIndex: number; // 0-based
  /** 표현이 유행한 대략 연도. 예: 최신 2025, 레트로 2003 */
  eraYear: number;
  /** 해설 1문장 (유래·의미 재미) */
  explain: string;
}

/**
 * 시험지에 실린 문항 — 선택지가 (시험지 시드 + 문항 id)로 결정적 셔플되고
 * answerIndex 가 셔플된 위치로 재매핑된 상태.
 */
export interface ShuffledItem extends Item {
  /** 셔플된 선택지 순서 */
  choices: string[];
  /** 셔플된 choices 기준으로 재매핑된 정답 위치 (0-based) */
  answerIndex: number;
}

/** 생성된 시험지 */
export interface Paper {
  seed: number;
  items: ShuffledItem[]; // 최신 5 + 레트로 5 = 10문항, 순서까지 확정
}

/** 세대 구간 (언어 나이 → 라벨) */
export interface Generation {
  /** 구간 하한(포함) */
  min: number;
  /** 구간 상한(포함) */
  max: number;
  /** 세대 키(문구 풀 조회용) */
  key: GenerationKey;
  /** 세대 라벨 */
  label: string;
}

export type GenerationKey =
  | "zalpha" // 15~19 잘파어 원어민
  | "native" // 20대 신조어 네이티브
  | "bilingual" // 30대 밀레니얼 바이링구얼
  | "gyopo" // 40대 유행어 교포
  | "student" // 50대 언어 유학생
  | "purist"; // 60+ 사전파 순수주의자

/** 갭 방향 — 언어 나이가 실제 나이보다 어린지/많은지 */
export type GapDirection = "younger" | "older" | "same";

/** 갭 크기 구간 */
export type GapBand = "none" | "small" | "medium" | "large";

/** 실제 나이 대비 갭 결과 */
export interface Gap {
  realAge: number;
  /** |실제 - 언어| */
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
  /** 세대 구간 */
  generation: Generation;
  /** 방향별 정답 수 */
  newCorrect: number;
  retroCorrect: number;
  /** 총 정답 수 (0~10) */
  totalCorrect: number;
  /** 실제 나이를 입력했을 때만 채워지는 갭 (없으면 null) */
  gap: Gap | null;
}
