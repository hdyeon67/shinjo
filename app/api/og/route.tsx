// 동적 OG 이미지 — 링크/카톡 미리보기 + PNG 저장용 "언어 나이" 카드.
//   next/og(satori) 기반, 외부 키·CDN 불필요. munhae 하드닝 패턴 적용:
//   - 한글 폰트는 public 의 Pretendard KS X 1001 서브셋(337KB) — 모듈 스코프 1회 로드
//   - 솔리드 배경/카드(그라데이션·섀도 최소)로 메모리 절약
//   - Cache API 로 d(결과)별 1회만 렌더 후 엣지 캐시
//   ※ 서브셋 폰트엔 이모지 글리프가 없어 이모지는 넣지 않는다(두부 방지).
//   fmt: og(600×315) · feed(640×640, 1:1) · story(640×1138, 9:16) · home(1200×630)

import { ImageResponse } from "next/og";
import { decodeResult } from "@/lib/share/encode";
import { generatePaper, read, type Reading } from "@/lib/shinjo-engine";
import { ITEMS } from "@/lib/content/items";
import { buildResultCopy } from "@/lib/content/select";

export const runtime = "nodejs";

const FONT_PATH = "/fonts/pretendard-kr-subset.ttf";
const BG = "#fbf3ff";
const INK = "#2a2440";
const CANDY = "#e8408a";
const GRAPE = "#6353e6";
const FAINT = "#8f88a8";

const SIZES: Record<string, { w: number; h: number }> = {
  og: { w: 600, h: 315 },
  feed: { w: 640, h: 640 },
  story: { w: 640, h: 1138 },
  home: { w: 1200, h: 630 },
};

let cachedFont: ArrayBuffer | null = null;
async function loadFont(origin: string): Promise<ArrayBuffer | null> {
  if (cachedFont) return cachedFont;
  try {
    const res = await fetch(new URL(FONT_PATH, origin), { cache: "force-cache" });
    if (!res.ok) return null;
    cachedFont = await res.arrayBuffer();
    return cachedFont;
  } catch {
    return null;
  }
}

const OG_HEADERS = {
  "Cache-Control": "public, immutable, no-transform, max-age=31536000, s-maxage=31536000",
};

export async function GET(req: Request): Promise<Response> {
  const cache = (globalThis as { caches?: { default?: Cache } }).caches?.default;
  const cacheKey = new Request(new URL(req.url).toString(), { method: "GET" });

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return hit;
  }

  const res = await render(req);

  if (cache && res.ok) {
    try {
      await cache.put(cacheKey, res.clone());
    } catch {
      /* 캐시 저장 실패 무시 */
    }
  }
  return res;
}

async function render(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  const d = searchParams.get("d");
  const fmt = searchParams.get("fmt") ?? "og";
  const { w, h } = SIZES[fmt] ?? SIZES.og;

  const font = await loadFont(req.url);
  const fonts = font
    ? [
        { name: "Pretendard", data: font, weight: 400 as const, style: "normal" as const },
        { name: "Pretendard", data: font, weight: 700 as const, style: "normal" as const },
      ]
    : undefined;

  const payload = d ? decodeResult(d) : null;

  if (!payload) {
    return new ImageResponse(<BrandCard scale={w / 1200} />, {
      width: w,
      height: h,
      fonts,
      headers: OG_HEADERS,
    });
  }

  const reading = read(generatePaper(ITEMS, payload.seed), payload.answers, payload.age);
  const copy = buildResultCopy(reading, payload.seed);
  const name = payload.nick?.trim() || "언어탐정";
  const s = w / 600;

  return new ImageResponse(
    <Card name={name} reading={reading} summary={copy.summary} scale={s} showSummary={h >= w} tall={h > w} />,
    { width: w, height: h, fonts, headers: OG_HEADERS },
  );
}

// 홈/기본 공유용 브랜드 카드 (1200×630 기준)
function BrandCard({ scale }: { scale: number }) {
  const px = (n: number) => Math.round(n * scale);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: BG,
        padding: px(48),
        fontFamily: "Pretendard",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          border: `${px(4)}px solid ${INK}`,
          borderRadius: px(28),
          padding: `${px(56)}px ${px(64)}px`,
          background: "#ffffff",
        }}
      >
        <div style={{ display: "flex", fontSize: px(30), color: GRAPE, letterSpacing: px(4) }}>
          최신 밈부터 그 시절 유행어까지
        </div>
        <div style={{ display: "flex", fontSize: px(112), fontWeight: 700, color: INK, marginTop: px(18) }}>
          신조어 판독기
        </div>
        <div style={{ display: "flex", fontSize: px(38), color: "#5b5378", marginTop: px(22) }}>
          10문항으로 판독하는 나의 언어 나이
        </div>
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            marginTop: px(30),
            border: `${px(4)}px solid ${INK}`,
            borderRadius: px(999),
            padding: `${px(12)}px ${px(28)}px`,
            fontSize: px(30),
            fontWeight: 700,
            color: CANDY,
          }}
        >
          shinjo.fineboll.com
        </div>
      </div>
    </div>
  );
}

function Card({
  name,
  reading,
  summary,
  scale,
  showSummary,
  tall,
}: {
  name: string;
  reading: Reading;
  summary: string;
  scale: number;
  showSummary: boolean;
  tall: boolean;
}) {
  const px = (n: number) => Math.round(n * scale);
  const { languageAge, generation, gap, newCorrect, retroCorrect } = reading;
  const gapText =
    gap == null
      ? null
      : gap.direction === "same"
        ? `몸도 언어도 ${gap.realAge}세 · 완벽 일치`
        : `몸은 ${gap.realAge}세 · 언어는 ${languageAge}세`;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: BG,
        fontFamily: "Pretendard",
        color: INK,
        padding: px(22),
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          background: "#ffffff",
          border: `${px(3)}px solid ${INK}`,
          borderRadius: px(20),
          padding: `${px(tall ? 40 : 22)}px ${px(28)}px`,
        }}
      >
        <div style={{ display: "flex", fontSize: px(15), color: FAINT, letterSpacing: px(2) }}>
          SHINJO · 언어 나이 판독
        </div>
        <div style={{ display: "flex", fontSize: px(18), color: "#5b5378", marginTop: px(6) }}>
          {name} 님의 언어 나이
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", marginTop: px(6) }}>
          <div style={{ display: "flex", fontSize: px(120), fontWeight: 700, lineHeight: 1, color: INK }}>
            {languageAge}
          </div>
          <div style={{ display: "flex", fontSize: px(40), fontWeight: 700, color: "#5b5378", marginBottom: px(12) }}>
            세
          </div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: px(10),
            border: `${px(3)}px solid ${INK}`,
            borderRadius: px(999),
            padding: `${px(8)}px ${px(22)}px`,
            fontSize: px(24),
            fontWeight: 700,
            color: INK,
          }}
        >
          {generation.label}
        </div>

        {gapText && (
          <div style={{ display: "flex", fontSize: px(18), color: "#5b5378", marginTop: px(12) }}>
            {gapText}
          </div>
        )}

        {showSummary && (
          <div
            style={{
              display: "flex",
              textAlign: "center",
              marginTop: px(tall ? 22 : 14),
              fontSize: px(18),
              lineHeight: 1.4,
              color: INK,
              maxWidth: px(520),
            }}
          >
            {summary}
          </div>
        )}

        <div style={{ display: "flex", gap: px(12), marginTop: px(16) }}>
          <div
            style={{
              display: "flex",
              fontSize: px(17),
              fontWeight: 700,
              color: CANDY,
              border: `${px(2)}px solid ${CANDY}`,
              borderRadius: px(10),
              padding: `${px(5)}px ${px(14)}px`,
            }}
          >
            최신 {newCorrect}/5
          </div>
          <div
            style={{
              display: "flex",
              fontSize: px(17),
              fontWeight: 700,
              color: GRAPE,
              border: `${px(2)}px solid ${GRAPE}`,
              borderRadius: px(10),
              padding: `${px(5)}px ${px(14)}px`,
            }}
          >
            레트로 {retroCorrect}/5
          </div>
        </div>

        <div style={{ display: "flex", fontSize: px(13), color: FAINT, marginTop: px(16) }}>
          shinjo.fineboll.com · 재미용 진단
        </div>
      </div>
    </div>
  );
}
