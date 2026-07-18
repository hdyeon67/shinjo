import { describe, it, expect } from "vitest";
import { generatePaper, PAPER_SIZE, TIER_TARGET, tierOf } from "../index";
import { FIXTURE_POOL, sampleSeeds } from "./fixtures";

describe("출제 구성 — 티어 비율·백필·문항 수", () => {
  it("모든 시험지는 10문항, 중복 없음", () => {
    for (const seed of sampleSeeds()) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      expect(paper.items).toHaveLength(PAPER_SIZE);
      const ids = paper.items.map((it) => it.id);
      expect(new Set(ids).size).toBe(PAPER_SIZE);
    }
  });

  it("티어가 충분하면 A2·B3·C3·D2 비율을 지킨다", () => {
    for (const seed of sampleSeeds()) {
      const counts = { A: 0, B: 0, C: 0, D: 0 } as Record<string, number>;
      for (const it of generatePaper(FIXTURE_POOL, seed).items) counts[tierOf(it.eraYear)] += 1;
      expect(counts.A).toBe(TIER_TARGET.A);
      expect(counts.B).toBe(TIER_TARGET.B);
      expect(counts.C).toBe(TIER_TARGET.C);
      expect(counts.D).toBe(TIER_TARGET.D);
    }
  });

  it("티어 A가 비어 있어도 백필로 10문항을 채운다", () => {
    // A(2025+) 제거한 풀 — 실제 초기 콘텐츠 상황(티어 A 미확보) 재현
    const noA = FIXTURE_POOL.filter((it) => tierOf(it.eraYear) !== "A");
    for (const seed of sampleSeeds().slice(0, 50)) {
      const paper = generatePaper(noA, seed);
      expect(paper.items).toHaveLength(PAPER_SIZE);
      expect(new Set(paper.items.map((it) => it.id)).size).toBe(PAPER_SIZE);
      expect(paper.items.every((it) => tierOf(it.eraYear) !== "A")).toBe(true);
    }
  });
});
