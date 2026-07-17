import { describe, it, expect } from "vitest";
import { generatePaper, PAPER_SIZE, DIRECTION_RATIO } from "../index";
import { FIXTURE_POOL, sampleSeeds } from "./fixtures";

describe("출제 구성 — 방향 비율·문항 수", () => {
  it("모든 시험지는 최신 5 + 레트로 5 = 10문항", () => {
    for (const seed of sampleSeeds()) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      expect(paper.items).toHaveLength(PAPER_SIZE);
      const news = paper.items.filter((it) => it.direction === "new").length;
      const retros = paper.items.filter((it) => it.direction === "retro").length;
      expect(news).toBe(DIRECTION_RATIO.new);
      expect(retros).toBe(DIRECTION_RATIO.retro);
    }
  });

  it("한 시험지 안에 중복 문항이 없다", () => {
    for (const seed of sampleSeeds()) {
      const ids = generatePaper(FIXTURE_POOL, seed).items.map((it) => it.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });
});
