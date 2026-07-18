# 신조어 판독기 (shinjo)

최신 신조어 10문항(약 90초)으로 내 **언어 나이**와 세대 라벨을 판독하는 재미 진단.
요즘 밈을 많이 알수록 언어 나이가 어려진다. eden appworks / fineboll 서비스.
(v2 개편 2026-07-18: 레트로 유행어 제거 → 최신 신조어 전용. docs/shinjo-newslang-pivot-2026-07-18.md)

- 배포: https://shinjo.fineboll.com (Cloudflare Workers · OpenNext)
- 스택: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- 원칙: **DB 없음 · 실시간 AI 호출 없음 · 결정적 로직 · 운영비 0원**. 결과 공유는
  `?d=` base64url(개인정보 미저장), 문제 재현은 `?s=` 시드.

## 구조

```
lib/shinjo-engine/   결정적 엔진 (프레임워크 무의존)
  hash.ts            fnv1a · mulberry32 · seededShuffle/Sample
  types.ts           Item · Paper · Reading · Generation · Gap
  constants.ts       튜닝 상수 (나이 델타 · 세대 구간 · 갭 밴드)
  paper.ts           generatePaper(티어 A2·B3·C3·D2 + 백필) · newSeed · parseSeed
  age.ts             read() 언어 나이(놓친 최신성만큼 가산) · 세대 라벨 · 갭 판독
lib/content/         items(40 신조어) · copy(문구 90) · select · guides · retro-archived(미사용)
lib/share/encode.ts  ?d= 결과 인코딩 (seed·answers·age?·nick?)
lib/analytics/       PostHog 쿠키리스 track (키 없으면 no-op)
lib/config/          site · flags(env) · promos(크로스 배너)
app/                 랜딩 · quiz · result · guide · about · privacy · api/og · sitemap · robots
components/          landing · quiz · result(LanguageAgeCard 등) · Ad* · Analytics
```

## 언어 나이 로직 v2 (constants.ts 에서 조정)

전부 정답이면 **15세(잘파어 원어민)**에서 시작 → 오답마다 그 문항의 최신성(티어)만큼 나이가
붙는다 → 클램프 15~40. 즉 **최신 밈을 놓칠수록 언어 나이가 올라간다.**

| 티어(eraYear) | 오답 시 가산 |
|---|---|
| A 최신 (2025~) | +3.0 |
| B (2023~24) | +2.7 |
| C (2021~22) | +2.4 |
| D 1세대 (~2020) | +2.1 |

세대 라벨 6구간(15~40): 잘파어 원어민 → 신조어 네이티브 → 생활파 → 이민자 → 관망러 →
무풍지대. 같은 답안 → 항상 같은 나이(결정적). ⚠️ 티어 A(2025~26)는 예리·꾸라 발주로 확보·갱신.

## 개발

```bash
npm install
npm run dev            # http://localhost:3000 (루트 launch.json 은 3001)
npm test               # vitest (엔진·콘텐츠·공유 인코딩)
npx tsc --noEmit       # 타입체크
```

## 배포 (Cloudflare Workers)

```bash
npm run cf:build && npm run cf:deploy
```

> ⚠️ **배포 함정**: `cf:deploy` 는 재빌드하지 않는다. 반드시 `cf:build && cf:deploy`
> 순서로. 또 `.env.local` 의 `NEXT_PUBLIC_SITE_URL` 은 빌드 전에 설정해야 OG URL 이
> 올바르게 인라인된다. CI 자동배포 시 애드핏/애드센스/PostHog 키는 Cloudflare Build
> 환경변수로 등록할 것(로컬 `.env.local` 은 반영되지 않음).

## 환경 변수 (전부 미설정 시 해당 기능 비활성)

| 키 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 절대 URL 베이스 (OG·sitemap) |
| `PAYMENT_ENABLED` | 결제 잠금 (기본 false) |
| `NEXT_PUBLIC_ADS_ENABLED` + `NEXT_PUBLIC_ADSENSE_CLIENT` | 애드센스 |
| `NEXT_PUBLIC_ADFIT_UNIT_MOBILE` | 카카오 애드핏 모바일 가로 배너(결과·가이드) |
| `NEXT_PUBLIC_ADFIT_UNIT_PC_LEFT` / `_PC_RIGHT` | 카카오 애드핏 PC 세로 레일(결과·가이드, xl+) |
| `NEXT_PUBLIC_KAKAO_JS_KEY` | 카카오톡 공유 버튼 |
| `NEXT_PUBLIC_POSTHOG_KEY` (+ `_HOST`) | PostHog 계측(쿠키리스) |
| `NEXT_PUBLIC_CF_BEACON_TOKEN` | Cloudflare Web Analytics |

광고(회사 정책 2026-07-18): **랜딩 포함 전 화면 노출** — AdRails(PC 세로 레일)+AdBottomMobile(모바일 하단 배너)을 레이아웃에 두고, **응시(`/quiz`)에서만 숨김**. env 온오프.

## 계측 이벤트 (app="shinjo", PII 미전송)

`landing_view` · `quiz_start` · `quiz_complete`(duration_band) · `result_view`(age_band=세대키)
· `share_click`(channel) · `cta_friend_click` · `cross_banner_click`(target).
실제 나이·닉네임 등 입력값은 **절대 전송하지 않는다**(세대·갭 구간만).

## 크로스 프로모션

`lib/config/promos.ts` 배열로 관리(현재: 문해력 최우선 · 행운부적 · 케미체크).
👉 **다른 앱에도 신조어 판독기 배너를 추가**하려면 각 앱 `lib/config/promos.ts` 에
`{ id:"shinjo", emoji:"🔍", title:"내 언어 나이는?", desc:"신조어 판독기", href:"https://shinjo.fineboll.com", color:"#ff5fa2" }`
항목을 넣으면 됨.

## ⚠️ 출시 전 사용자 검수 (필수)

- **신조어 최신성**: `lib/content/items.ts` 의 NEW 20문항을 2025~26 최신 표현 기준으로
  검수·교체. 현재는 인지도 높은 2019~2023 표현 위주(재미 진단이라 유행 시점이 생명).
- **레트로 의미·유래**: RETRO 20문항의 뜻·유래를 세대 감수성 기준으로 확인.
- 위 검수 후 `cf:build && cf:deploy`, 이어서 키 해금(애드핏·애드센스·카카오·PostHog).
