// 결과 공유 인코딩 — ?d= base64url.
// DB 없이 URL 만으로 결과를 재현한다. 개인정보는 서버에 저장하지 않고,
// 재현에 필요한 값(시드·답안)과 표시용 값(닉네임·실제 나이)만 URL 안에 담는다.
// 실제 나이는 갭 표시용이며 URL 인코딩 외 어디에도 저장·전송하지 않는다.
// btoa/atob + TextEncoder/TextDecoder 로 브라우저·Cloudflare Workers·Node 공용.

export interface ResultPayload {
  /** 시험지 시드 (재현 핵심, ?s= 와 동일) */
  seed: number;
  /** 문항별 고른 선택지 인덱스(0~3), 미응답은 -1 */
  answers: number[];
  /** 실제 나이(선택, 갭 표시용). 15~99 범위 밖이면 무시 */
  age?: number;
  /** 결과 카드 표시용 닉네임(선택, 짧게) */
  nick?: string;
}

const MAX_ANSWERS = 10;
const MAX_NICK = 12;
const AGE_MIN = 5;
const AGE_MAX = 99;

/** 문자열 → base64url */
function b64urlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** base64url → 문자열 */
function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

/** 유효한 실제 나이만 통과 (그 외 undefined) */
function normalizeAge(age: unknown): number | undefined {
  if (typeof age !== "number" || !Number.isFinite(age)) return undefined;
  const a = Math.round(age);
  return a >= AGE_MIN && a <= AGE_MAX ? a : undefined;
}

/** 결과 payload → ?d= 값 */
export function encodeResult(p: ResultPayload): string {
  const compact = {
    v: 1,
    s: p.seed >>> 0,
    a: p.answers.slice(0, MAX_ANSWERS).map((n) => (Number.isInteger(n) ? n : -1)),
    g: normalizeAge(p.age),
    n: p.nick ? p.nick.slice(0, MAX_NICK) : undefined,
  };
  return b64urlEncode(JSON.stringify(compact));
}

/** ?d= 값 → 결과 payload. 형식이 어긋나면 null */
export function decodeResult(d: string): ResultPayload | null {
  try {
    const o = JSON.parse(b64urlDecode(d)) as Record<string, unknown>;
    if (o.v !== 1) return null;
    if (typeof o.s !== "number" || !Number.isFinite(o.s)) return null;
    if (!Array.isArray(o.a) || o.a.length === 0 || o.a.length > MAX_ANSWERS) return null;
    const answers = o.a.map((n) => (typeof n === "number" && Number.isInteger(n) ? n : -1));
    const nick = typeof o.n === "string" ? o.n.slice(0, MAX_NICK) : undefined;
    const age = normalizeAge(o.g);
    return { seed: o.s >>> 0, answers, age, nick };
  } catch {
    return null;
  }
}
