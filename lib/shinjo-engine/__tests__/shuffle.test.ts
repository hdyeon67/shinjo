import { describe, it, expect } from "vitest";
import { generatePaper } from "../index";
import { FIXTURE_POOL, sampleSeeds } from "./fixtures";

// 원본 문항 id → 원본 정답 텍스트
const ORIG_ANSWER = new Map(FIXTURE_POOL.map((it) => [it.id, it.choices[it.answerIndex]]));

describe("선택지 셔플 — 결정성 · 정답 재매핑 · 위치 분포", () => {
  it("같은 시드에서 선택지 순서가 결정적으로 동일", () => {
    const seed = 424242;
    const a = generatePaper(FIXTURE_POOL, seed);
    const b = generatePaper(FIXTURE_POOL, seed);
    a.items.forEach((it, i) => expect(it.choices).toEqual(b.items[i].choices));
  });

  it("재매핑된 answerIndex 는 항상 원래 정답 텍스트를 가리킨다", () => {
    for (const seed of sampleSeeds()) {
      for (const it of generatePaper(FIXTURE_POOL, seed).items) {
        expect(it.choices).toHaveLength(4);
        expect(it.choices[it.answerIndex]).toBe(ORIG_ANSWER.get(it.id));
      }
    }
  });

  it("셔플이 선택지를 실제로 섞는다 (원본 순서 보존이 아님)", () => {
    let reordered = 0;
    for (const seed of sampleSeeds()) {
      for (const it of generatePaper(FIXTURE_POOL, seed).items) {
        const orig = FIXTURE_POOL.find((p) => p.id === it.id)!;
        if (JSON.stringify(it.choices) !== JSON.stringify(orig.choices)) reordered += 1;
      }
    }
    expect(reordered).toBeGreaterThan(0);
  });

  it("정답 위치가 ①~④에 고르게 분포한다 (쏠림 무력화)", () => {
    const buckets = [0, 0, 0, 0];
    let total = 0;
    for (const seed of sampleSeeds()) {
      for (const it of generatePaper(FIXTURE_POOL, seed).items) {
        buckets[it.answerIndex] += 1;
        total += 1;
      }
    }
    // 이상적 균등 = 25%. 편향 픽스처였음에도 각 위치가 12~40% 범위면 쏠림이 깨진 것.
    for (const count of buckets) {
      const share = count / total;
      expect(share).toBeGreaterThan(0.12);
      expect(share).toBeLessThan(0.4);
    }
  });
});
