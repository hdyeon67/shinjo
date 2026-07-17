import { describe, it, expect } from "vitest";
import { generatePaper, parseSeed } from "../index";
import { FIXTURE_POOL, sampleSeeds } from "./fixtures";

describe("결정성 — 같은 시드는 항상 같은 시험지", () => {
  it("generatePaper 1000회 반복 완전 동일", () => {
    const seed = 20260718;
    const first = JSON.stringify(generatePaper(FIXTURE_POOL, seed));
    for (let i = 0; i < 1000; i++) {
      expect(JSON.stringify(generatePaper(FIXTURE_POOL, seed))).toBe(first);
    }
  });

  it("?s= 시드 재현성 — 같은 정수 시드 → 같은 문항·순서·선택지", () => {
    const seed = 987654;
    const a = generatePaper(FIXTURE_POOL, seed);
    const b = generatePaper(FIXTURE_POOL, seed);
    expect(a.items.map((it) => it.id)).toEqual(b.items.map((it) => it.id));
    a.items.forEach((it, i) => {
      expect(it.choices).toEqual(b.items[i].choices);
      expect(it.answerIndex).toBe(b.items[i].answerIndex);
    });
  });

  it("다른 시드는 다른 시험지를 만든다 (상수가 아님)", () => {
    const papers = new Set(sampleSeeds().map((s) => JSON.stringify(generatePaper(FIXTURE_POOL, s))));
    expect(papers.size).toBeGreaterThan(50);
  });

  it("parseSeed — 순수 숫자는 그대로, 문자열은 해시, 빈값/누락은 null", () => {
    expect(parseSeed("12345")).toBe(12345);
    expect(parseSeed("12345")).toBe(parseSeed("12345")); // 안정적
    expect(parseSeed(null)).toBeNull();
    expect(parseSeed("")).toBeNull();
    expect(parseSeed("  ")).toBeNull();
    // 비숫자 문자열도 안정적 시드로 정규화
    expect(parseSeed("hello")).toBe(parseSeed("hello"));
    expect(parseSeed("hello")).not.toBe(parseSeed("world"));
  });
});
