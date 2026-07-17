// shinjo-engine 배럴 — 출제/판독 엔진의 공개 API.
// 프레임워크 무의존·완전 결정적. UI(Phase 3+)는 이 모듈만 소비한다.

export * from "./types";
export * from "./constants";
export {
  fnv1a,
  mulberry32,
  seededJitter,
  deriveIndex,
  seededShuffle,
  seededSample,
} from "./hash";
export { generatePaper, newSeed, parseSeed } from "./paper";
export { read, itemDelta, generationFor, gapFor } from "./age";
