// 사이트 기본 정보. 배포 도메인은 shinjo.fineboll.com.

export const SITE = {
  name: "신조어 판독기",
  domain: "shinjo.fineboll.com",
  description:
    "최신 신조어 10문항으로 보는 나의 언어 나이 테스트. 요즘 밈을 알수록 어려지는 언어 나이, 잘파어 원어민일까 신조어 무풍지대일까? 결과 카드를 친구와 공유하고 같은 문제로 대결하세요. 재미·참고용 콘텐츠입니다.",
} as const;

/** 절대 URL 베이스 (OG/공유용). 환경변수 없으면 배포 도메인 기준. */
export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL;
  if (env) return env.replace(/\/$/, "");
  return `https://${SITE.domain}`;
}
