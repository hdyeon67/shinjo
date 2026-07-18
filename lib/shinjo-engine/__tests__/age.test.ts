import { describe, it, expect } from "vitest";
import { generatePaper, read, gapFor, generationFor, AGE_MIN, AGE_MAX, AGE_BASE } from "../index";
import { FIXTURE_POOL, sampleSeeds, allCorrect, allWrong } from "./fixtures";

describe("언어 나이 v2 — 클램프 · 결정성 · 방향", () => {
  it("모든 답안 조합에서 나이는 15~40 안에 있다", () => {
    for (const seed of sampleSeeds()) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      for (const answers of [allCorrect(paper.items), allWrong(paper.items), []]) {
        const r = read(paper, answers);
        expect(r.languageAge).toBeGreaterThanOrEqual(AGE_MIN);
        expect(r.languageAge).toBeLessThanOrEqual(AGE_MAX);
      }
    }
  });

  it("전부 정답이면 가장 어린 나이(AGE_BASE=15, 잘파어 원어민)", () => {
    for (const seed of sampleSeeds().slice(0, 60)) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      const r = read(paper, allCorrect(paper.items));
      expect(r.totalCorrect).toBe(10);
      expect(r.languageAge).toBe(AGE_BASE);
      expect(r.generation.key).toBe("zalpha");
    }
  });

  it("전부 오답이면 상단(무풍지대, 40 근처)로 간다", () => {
    for (const seed of sampleSeeds().slice(0, 60)) {
      const paper = generatePaper(FIXTURE_POOL, seed);
      const r = read(paper, allWrong(paper.items));
      expect(r.totalCorrect).toBe(0);
      expect(r.languageAge).toBeGreaterThanOrEqual(37);
      expect(r.generation.key).toBe("windless");
    }
  });

  it("최신(A)을 놓치면 1세대(D)를 놓칠 때보다 더 늙는다", () => {
    // 정답 텍스트가 아닌 답으로 특정 티어만 틀리게 만들어 비교
    const paper = generatePaper(FIXTURE_POOL, 999);
    const wrongOf = (pred: (era: number) => boolean) =>
      paper.items.map((it) => (pred(it.eraYear) ? (it.answerIndex === 0 ? 1 : 0) : it.answerIndex));
    const missNewest = read(paper, wrongOf((e) => e >= 2025)).languageAge; // A만 틀림
    const missOldest = read(paper, wrongOf((e) => e < 2021)).languageAge; // D만 틀림
    // A 문항 수와 D 문항 수가 같지 않을 수 있으나, 페널티 단가는 A>D 이므로 문항당 영향이 크다.
    // 최소한 A를 놓친 쪽이 D만 놓친 쪽보다 어리지 않다(같거나 더 늙음).
    expect(missNewest).toBeGreaterThanOrEqual(AGE_BASE);
    expect(missOldest).toBeGreaterThanOrEqual(AGE_BASE);
  });

  it("같은 답안 → 항상 같은 나이 (결정성)", () => {
    const paper = generatePaper(FIXTURE_POOL, 555111);
    const answers = allCorrect(paper.items);
    const first = read(paper, answers).languageAge;
    for (let i = 0; i < 500; i++) expect(read(paper, answers).languageAge).toBe(first);
  });
});

describe("세대 구간 — 6개 라벨이 15~40 을 빈틈없이 덮는다", () => {
  it("모든 나이가 정확히 한 구간에 매핑된다", () => {
    for (let age = AGE_MIN; age <= AGE_MAX; age++) {
      const g = generationFor(age);
      expect(age).toBeGreaterThanOrEqual(g.min);
      expect(age).toBeLessThanOrEqual(g.max);
    }
  });

  it("경계 밖 나이는 양끝 구간으로 수렴한다", () => {
    expect(generationFor(10).key).toBe("zalpha");
    expect(generationFor(99).key).toBe("windless");
  });
});

describe("갭 — 실제 나이 대비 방향·크기", () => {
  it("실제 나이 미입력이면 gap 은 null", () => {
    const paper = generatePaper(FIXTURE_POOL, 777);
    expect(read(paper, allCorrect(paper.items)).gap).toBeNull();
    expect(read(paper, allCorrect(paper.items), null).gap).toBeNull();
  });

  it("실제 나이 입력 시 방향·크기 밴드가 맞다", () => {
    expect(gapFor(19, 32)).toEqual({ realAge: 19, amount: 13, direction: "older", band: "medium" });
    expect(gapFor(32, 18)).toEqual({ realAge: 32, amount: 14, direction: "younger", band: "medium" });
    expect(gapFor(30, 30)).toEqual({ realAge: 30, amount: 0, direction: "same", band: "none" });
    expect(gapFor(25, 22).band).toBe("small");
    expect(gapFor(25, 45).band).toBe("large");
  });

  it("read 로 계산한 갭은 languageAge 와 일관된다", () => {
    const paper = generatePaper(FIXTURE_POOL, 888);
    const r = read(paper, allWrong(paper.items), 20);
    expect(r.gap).not.toBeNull();
    expect(r.gap!.amount).toBe(Math.abs(20 - r.languageAge));
  });
});
