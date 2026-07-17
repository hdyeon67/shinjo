import { describe, it, expect } from "vitest";
import { encodeResult, decodeResult, type ResultPayload } from "../encode";

describe("결과 공유 인코딩 — round-trip · 방어", () => {
  it("기본 payload 왕복", () => {
    const p: ResultPayload = { seed: 123456789, answers: [0, 1, 2, 3, 0, 1, 2, 3, 0, 1] };
    const back = decodeResult(encodeResult(p));
    expect(back).not.toBeNull();
    expect(back!.seed).toBe(123456789);
    expect(back!.answers).toEqual([0, 1, 2, 3, 0, 1, 2, 3, 0, 1]);
    expect(back!.age).toBeUndefined();
    expect(back!.nick).toBeUndefined();
  });

  it("실제 나이·닉네임 포함 왕복", () => {
    const back = decodeResult(encodeResult({ seed: 7, answers: [0, 0, 0, 0, 0], age: 27, nick: "판독왕" }));
    expect(back!.age).toBe(27);
    expect(back!.nick).toBe("판독왕");
  });

  it("범위 밖 실제 나이는 버린다", () => {
    expect(decodeResult(encodeResult({ seed: 1, answers: [0], age: 200 }))!.age).toBeUndefined();
    expect(decodeResult(encodeResult({ seed: 1, answers: [0], age: 2 }))!.age).toBeUndefined();
  });

  it("닉네임은 12자로 자른다", () => {
    const back = decodeResult(encodeResult({ seed: 1, answers: [0], nick: "가나다라마바사아자차카타파" }));
    expect(back!.nick!.length).toBe(12);
  });

  it("손상·빈 입력은 null", () => {
    expect(decodeResult("!!!not-base64!!!")).toBeNull();
    expect(decodeResult("")).toBeNull();
    expect(decodeResult(encodeResult({ seed: 1, answers: [] }))).toBeNull(); // 빈 답안
  });

  it("seed 는 32bit 부호 없는 정수로 정규화", () => {
    const back = decodeResult(encodeResult({ seed: 0xffffffff, answers: [1] }));
    expect(back!.seed).toBe(0xffffffff);
  });
});
