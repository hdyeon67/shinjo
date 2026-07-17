import { describe, it, expect } from "vitest";
import {
  generatePaper,
  read,
  gapFor,
  generationFor,
  AGE_MIN,
  AGE_MAX,
} from "../index";
import { FIXTURE_POOL, sampleSeeds, allCorrect, allWrong } from "./fixtures";

describe("언어 나이 — 클램프 · 결정성 · 극단 방향", () => {
  it("모든 답안 조합에서 나이는 15~65 안에 있다", () => {
    for (const seed of sampleSeeds()) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      for (const answers of [allCorrect(paper.items), allWrong(paper.items), []]) {
        const r = read(paper, answers);
        expect(r.languageAge).toBeGreaterThanOrEqual(AGE_MIN);
        expect(r.languageAge).toBeLessThanOrEqual(AGE_MAX);
      }
    }
  });

  it("같은 답안 → 항상 같은 나이 (결정성)", () => {
    const paper = generatePaper(FIXTURE_POOL, 555111);
    const answers = allCorrect(paper.items);
    const first = read(paper, answers).languageAge;
    for (let i = 0; i < 500; i++) {
      expect(read(paper, answers).languageAge).toBe(first);
    }
  });

  it("전부 정답(최신 통달·레트로 통달)이면 최신에 강하게 젊어진다", () => {
    // 픽스처: 최신 정답 -3, 레트로 정답 +4 → 30 -15 +20 = 35 (밀레니얼 바이링구얼)
    const paper = generatePaper(FIXTURE_POOL, 111);
    const r = read(paper, allCorrect(paper.items));
    expect(r.totalCorrect).toBe(10);
    expect(r.newCorrect).toBe(5);
    expect(r.retroCorrect).toBe(5);
    expect(r.languageAge).toBe(35);
  });

  it("가장 어린 결과 — 최신만 맞히고 레트로는 다 틀리면 15세로 수렴", () => {
    // 최신 정답 5×-3 = -15, 레트로 오답 5×-2 = -10 → 30 -25 = 5 → clamp 15
    const paper = generatePaper(FIXTURE_POOL, 222);
    const answers = paper.items.map((it) =>
      it.direction === "new" ? it.answerIndex : it.answerIndex === 0 ? 1 : 0,
    );
    const r = read(paper, answers);
    expect(r.languageAge).toBe(AGE_MIN);
    expect(r.generation.key).toBe("zalpha");
  });

  it("가장 나이 든 결과 — 레트로만 맞히고 최신은 다 틀리면 사전파(60+)에 도달", () => {
    // 최신 오답 5×+2 = +10, 레트로 정답 5×+4 = +20 → 30 +30 = 60
    const paper = generatePaper(FIXTURE_POOL, 333);
    const answers = paper.items.map((it) =>
      it.direction === "retro" ? it.answerIndex : it.answerIndex === 0 ? 1 : 0,
    );
    const r = read(paper, answers);
    expect(r.languageAge).toBe(60);
    expect(r.generation.key).toBe("purist");
  });
});

describe("세대 구간 — 6개 라벨이 15~65 를 빈틈없이 덮는다", () => {
  it("모든 나이가 정확히 한 구간에 매핑된다", () => {
    for (let age = AGE_MIN; age <= AGE_MAX; age++) {
      const g = generationFor(age);
      expect(age).toBeGreaterThanOrEqual(g.min);
      expect(age).toBeLessThanOrEqual(g.max);
    }
  });

  it("경계 밖 나이는 양끝 구간으로 수렴한다", () => {
    expect(generationFor(10).key).toBe("zalpha");
    expect(generationFor(99).key).toBe("purist");
  });
});

describe("갭 — 실제 나이 대비 방향·크기", () => {
  it("실제 나이 미입력이면 gap 은 null", () => {
    const paper = generatePaper(FIXTURE_POOL, 777);
    expect(read(paper, allCorrect(paper.items)).gap).toBeNull();
    expect(read(paper, allCorrect(paper.items), null).gap).toBeNull();
  });

  it("실제 나이 입력 시 방향·크기 밴드가 맞다", () => {
    // 언어 32, 실제 19 → 언어가 더 많음(older), 갭 13 (medium)
    expect(gapFor(19, 32)).toEqual({ realAge: 19, amount: 13, direction: "older", band: "medium" });
    // 언어 18, 실제 32 → 언어가 더 어림(younger), 갭 14 (medium)
    expect(gapFor(32, 18)).toEqual({ realAge: 32, amount: 14, direction: "younger", band: "medium" });
    // 언어 30, 실제 30 → same, none
    expect(gapFor(30, 30)).toEqual({ realAge: 30, amount: 0, direction: "same", band: "none" });
    // 갭 3 → small
    expect(gapFor(25, 22).band).toBe("small");
    // 갭 20 → large
    expect(gapFor(25, 45).band).toBe("large");
  });

  it("read 로 계산한 갭은 languageAge 와 일관된다", () => {
    const paper = generatePaper(FIXTURE_POOL, 888);
    const r = read(paper, allCorrect(paper.items), 45);
    expect(r.gap).not.toBeNull();
    expect(r.gap!.amount).toBe(Math.abs(45 - r.languageAge));
  });
});
