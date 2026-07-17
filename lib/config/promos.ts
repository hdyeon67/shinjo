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
    id: "munhae",
    emoji: "📝",
    title: "문해력도 궁금하다면?",
    desc: "오늘의 시험지 10문항, 내 문해력 등급은",
    href: "https://munhae.fineboll.com",
    color: "#3f7fdd",
  },
  {
    id: "bujeok",
    emoji: "🧧",
    title: "행운이 필요하다면?",
    desc: "소원 골라 뽑는 귀여운 행운부적",
    href: "https://bujeok.fineboll.com",
    color: "#ff5b3a",
  },
  {
    id: "chemicheck",
    emoji: "💞",
    title: "궁합도 궁금하다면?",
    desc: "이름과 생년월일로 보는 케미체크",
    href: "https://chemicheck.fineboll.com",
    color: "#ff5db1",
  },
];
