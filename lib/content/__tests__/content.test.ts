import { describe, it, expect } from "vitest";
import {
  generatePaper,
  read,
  gapFor,
  DIRECTIONS,
  DIRECTION_RATIO,
  GENERATION_KEYS,
  type GapBand,
} from "@/lib/shinjo-engine";

/** GAP_COMMENTS 의 방향 키 (일치=none 제외) */
type GapDir = "younger" | "older";
import { ITEMS } from "../items";
import { GENERATION_SUMMARIES, GAP_COMMENTS, GAP_SAME } from "../copy";
import { selectGenerationSummary, selectGapComment, buildResultCopy } from "../select";

// 결정적 와이드 시드 표본
function seeds(): number[] {
  const out: number[] = [];
  for (let a = 0; a < 40; a++) for (let b = 0; b < 10; b++) out.push(a * 7919 + b * 104729 + 999);
  return out;
}

describe("문항 풀 무결성 (실제 40문항)", () => {
  it("총 40문항, 방향별 20문항", () => {
    expect(ITEMS).toHaveLength(40);
    for (const dir of DIRECTIONS) {
      expect(ITEMS.filter((it) => it.direction === dir)).toHaveLength(20);
    }
  });

  it("id 는 고유하다", () => {
    const ids = ITEMS.map((it) => it.id);
    expect(new Set(ids).size).toBe(40);
  });

  it("모든 문항: 선택지 4개 · answerIndex 0~3 · 질문/해설 비어있지 않음 · eraYear 정수", () => {
    for (const it of ITEMS) {
      expect(it.choices).toHaveLength(4);
      expect(new Set(it.choices).size).toBe(4); // 선택지 중복 없음
      expect(it.answerIndex).toBeGreaterThanOrEqual(0);
      expect(it.answerIndex).toBeLessThan(4);
      expect(it.question.trim().length).toBeGreaterThan(0);
      expect(it.explain.trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(it.eraYear)).toBe(true);
    }
  });

  it("eraYear 대역: 신조어는 2015 이후, 레트로는 2012 이전", () => {
    for (const it of ITEMS) {
      if (it.direction === "new") expect(it.eraYear).toBeGreaterThanOrEqual(2015);
      else expect(it.eraYear).toBeLessThanOrEqual(2012);
    }
  });
});

describe("실제 풀로 시험지 생성", () => {
  const ORIG_ANSWER = new Map(ITEMS.map((it) => [it.id, it.choices[it.answerIndex]]));

  it("항상 최신 5 + 레트로 5, 10문항, 중복 없음", () => {
    for (const seed of seeds()) {
      const paper = generatePaper(ITEMS, seed);
      expect(paper.items).toHaveLength(10);
      const counts = { new: 0, retro: 0 } as Record<string, number>;
      for (const it of paper.items) counts[it.direction] += 1;
      for (const dir of DIRECTIONS) expect(counts[dir]).toBe(DIRECTION_RATIO[dir]);
      expect(new Set(paper.items.map((it) => it.id)).size).toBe(10);
    }
  });

  it("선택지 셔플 후에도 정답 텍스트가 보존된다", () => {
    for (const seed of seeds()) {
      for (const it of generatePaper(ITEMS, seed).items) {
        expect(it.choices[it.answerIndex]).toBe(ORIG_ANSWER.get(it.id));
      }
    }
  });
});

describe("결과 문구 풀 카운트·커버리지", () => {
  it("세대 총평: 6구간 각 8변형 = 48개", () => {
    let total = 0;
    for (const key of GENERATION_KEYS) {
      expect(GENERATION_SUMMARIES[key]).toHaveLength(8);
      total += GENERATION_SUMMARIES[key].length;
    }
    expect(total).toBe(48);
  });

  it("갭 코멘트: 2방향 × 3구간 각 6변형 = 36개", () => {
    let total = 0;
    for (const dir of ["younger", "older"] as GapDir[]) {
      for (const band of ["small", "medium", "large"] as GapBand[]) {
        expect(GAP_COMMENTS[dir][band]).toHaveLength(6);
        total += GAP_COMMENTS[dir][band].length;
      }
    }
    expect(total).toBe(36);
  });

  it("갭 일치(none) 풀 6개, 전 문구 비어있지 않음", () => {
    expect(GAP_SAME).toHaveLength(6);
    const all = [
      ...GENERATION_KEYS.flatMap((k) => GENERATION_SUMMARIES[k]),
      ...(["younger", "older"] as GapDir[]).flatMap((d) =>
        (["small", "medium", "large"] as GapBand[]).flatMap((b) => GAP_COMMENTS[d][b]),
      ),
      ...GAP_SAME,
    ];
    expect(all).toHaveLength(48 + 36 + 6);
    for (const line of all) expect(line.trim().length).toBeGreaterThan(0);
  });
});

describe("문구 선택 로직", () => {
  it("세대 총평 선택은 결정적이고 항상 해당 풀 안의 값", () => {
    const paper = generatePaper(ITEMS, 12345);
    for (const seed of [1, 42, 12345, 999999]) {
      const r = read(paper, paper.items.map((it) => it.answerIndex));
      const s = selectGenerationSummary(r, seed);
      expect(s).toBe(selectGenerationSummary(r, seed));
      expect(GENERATION_SUMMARIES[r.generation.key]).toContain(s);
    }
  });

  it("갭 코멘트 선택 — 방향/구간별 결정적, none 은 GAP_SAME", () => {
    for (const seed of [1, 42, 12345]) {
      // older medium
      const g1 = gapFor(19, 32);
      const c1 = selectGapComment(g1, seed);
      expect(c1).toBe(selectGapComment(g1, seed));
      expect(GAP_COMMENTS.older.medium).toContain(c1);
      // younger large
      const g2 = gapFor(45, 20);
      expect(GAP_COMMENTS.younger.large).toContain(selectGapComment(g2, seed));
      // none
      const g3 = gapFor(30, 30);
      expect(GAP_SAME).toContain(selectGapComment(g3, seed));
      // 갭 없음
      expect(selectGapComment(null, seed)).toBeNull();
    }
  });

  it("buildResultCopy: 세대 총평 + 갭 코멘트가 reading 과 일치", () => {
    const paper = generatePaper(ITEMS, 246810);
    const answers = paper.items.map((it, i) => (i % 2 === 0 ? it.answerIndex : (it.answerIndex + 1) % 4));
    const r = read(paper, answers, 25);
    const copy = buildResultCopy(r, paper.seed);
    expect(GENERATION_SUMMARIES[r.generation.key]).toContain(copy.summary);
    expect(copy.gapComment).not.toBeNull();
    if (r.gap && r.gap.direction !== "same") {
      expect(GAP_COMMENTS[r.gap.direction][r.gap.band]).toContain(copy.gapComment);
    }
  });
});
