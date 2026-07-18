// 크로스 프로모션 대상 앱 목록 (config 배열).
// 앱이 늘면 항목만 추가하면 결과 페이지 하단 배너가 자동 노출된다.
// href 는 안정 커스텀 도메인(fineboll.com 서브도메인) — 호스팅 컷오버와 무관하게 유지.
//
// 순서 = 노출 우선순위. 신조어 판독기는 같은 퀴즈 결의 "문해력 모의고사"를 최우선으로 둔다.

export interface PromoApp {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  href: string;
  /** 배너 배경 힌트 컬러 */
  color: string;
}

export const PROMOS: PromoApp[] = [
  {
    // 같은 퀴즈 결끼리만 노출 — 신조어(언어 나이)와 짝인 문해력 모의고사 (스펙 v2: shinjo → 문해력)
    id: "munhae",
    emoji: "📝",
    title: "문해력도 궁금하다면?",
    desc: "오늘의 시험지 10문항, 내 문해력 등급은",
    href: "https://munhae.fineboll.com",
    color: "#3f7fdd",
  },
];
