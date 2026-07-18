import { describe, it, expect } from "vitest";
import {
  generatePaper,
  read,
  gapFor,
  PAPER_SIZE,
  GENERATION_KEYS,
  tierOf,
  type GapBand,
} from "@/lib/shinjo-engine";
import { ITEMS } from "../items";
import { GENERATION_SUMMARIES, GAP_COMMENTS, GAP_SAME } from "../copy";
import { selectGenerationSummary, selectGapComment, buildResultCopy } from "../select";

type GapDir = "younger" | "older";

function seeds(): number[] {
  const out: number[] = [];
  for (let a = 0; a < 40; a++) for (let b = 0; b < 10; b++) out.push(a * 7919 + b * 104729 + 999);
  return out;
}

describe("문항 풀 무결성 (v2: 최신 신조어 40)", () => {
  it("총 40문항, id 고유", () => {
    expect(ITEMS.length).toBe(40);
    expect(new Set(ITEMS.map((it) => it.id)).size).toBe(40);
  });

  it("모든 문항: 선택지 4개·중복 없음 · answerIndex 0~3 · 질문/해설 비어있지 않음 · eraYear 신조어 대역(≥2015)", () => {
    for (const it of ITEMS) {
      expect(it.choices).toHaveLength(4);
      expect(new Set(it.choices).size).toBe(4);
      expect(it.answerIndex).toBeGreaterThanOrEqual(0);
      expect(it.answerIndex).toBeLessThan(4);
      expect(it.question.trim().length).toBeGreaterThan(0);
      expect(it.explain.trim().length).toBeGreaterThan(0);
      expect(Number.isInteger(it.eraYear)).toBe(true);
      expect(it.eraYear).toBeGreaterThanOrEqual(2015); // 전부 신조어(레트로 없음)
    }
  });

  it("티어 B·C·D 는 문항이 있다 (A 최신은 예리·꾸라 발주로 채움 → 없을 수 있음)", () => {
    const byTier = { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>;
    for (const it of ITEMS) byTier[tierOf(it.eraYear)] += 1;
    expect(byTier.B).toBeGreaterThan(0);
    expect(byTier.C).toBeGreaterThan(0);
    expect(byTier.D).toBeGreaterThan(0);
  });
});

describe("실제 풀로 시험지 생성", () => {
  const ORIG_ANSWER = new Map(ITEMS.map((it) => [it.id, it.choices[it.answerIndex]]));

  it("항상 10문항, 중복 없음, 정답 텍스트 보존", () => {
    for (const seed of seeds()) {
      const paper = generatePaper(ITEMS, seed);
      expect(paper.items).toHaveLength(PAPER_SIZE);
      expect(new Set(paper.items.map((it) => it.id)).size).toBe(PAPER_SIZE);
      for (const it of paper.items) expect(it.choices[it.answerIndex]).toBe(ORIG_ANSWER.get(it.id));
    }
  });

  it("전부 정답이면 언어 나이 15(잘파어 원어민)", () => {
    const paper = generatePaper(ITEMS, 314159);
    const r = read(paper, paper.items.map((it) => it.answerIndex));
    expect(r.languageAge).toBe(15);
    expect(r.generation.key).toBe("zalpha");
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

  it("갭 코멘트 36 + 일치 6, 전 문구 비어있지 않음", () => {
    let g = 0;
    for (const dir of ["younger", "older"] as GapDir[])
      for (const band of ["small", "medium", "large"] as GapBand[]) {
        expect(GAP_COMMENTS[dir][band]).toHaveLength(6);
        g += 6;
      }
    expect(g).toBe(36);
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
  it("세대 총평·갭 선택은 결정적이고 항상 해당 풀 안의 값", () => {
    const paper = generatePaper(ITEMS, 246810);
    const answers = paper.items.map((it, i) => (i % 2 === 0 ? it.answerIndex : (it.answerIndex + 1) % 4));
    for (const seed of [1, 42, 12345]) {
      const r = read(paper, answers, 25);
      const s = selectGenerationSummary(r, seed);
      expect(s).toBe(selectGenerationSummary(r, seed));
      expect(GENERATION_SUMMARIES[r.generation.key]).toContain(s);
      const c = selectGapComment(r.gap, seed);
      expect(c).toBe(selectGapComment(r.gap, seed));
    }
  });

  it("buildResultCopy: 세대 총평 + 갭 코멘트가 reading 과 일치", () => {
    const paper = generatePaper(ITEMS, 111222);
    const r = read(paper, paper.items.map((it, i) => (i < 5 ? it.answerIndex : -1)), 25);
    const copy = buildResultCopy(r, paper.seed);
    expect(GENERATION_SUMMARIES[r.generation.key]).toContain(copy.summary);
    if (r.gap && r.gap.direction !== "same") {
      expect(GAP_COMMENTS[r.gap.direction][r.gap.band]).toContain(copy.gapComment);
    }
  });

  it("갭 방향/구간 매핑 확인", () => {
    expect(GAP_COMMENTS.older.medium).toContain(selectGapComment(gapFor(19, 32), 7));
    expect(GAP_SAME).toContain(selectGapComment(gapFor(30, 30), 7));
    expect(selectGapComment(null, 7)).toBeNull();
  });
});
