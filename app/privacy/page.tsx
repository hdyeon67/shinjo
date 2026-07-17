import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: "신조어 판독기의 개인정보처리방침 — 개인정보를 서버에 저장하지 않는 원칙을 안내합니다.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <Link href="/" className="text-ink-faint text-sm">
        ← 홈으로
      </Link>
      <h1 className="mt-3 text-3xl font-black text-ink">개인정보처리방침</h1>
      <p className="text-ink-faint mt-1 text-xs">시행일: 2026-07-18</p>

      <div className="text-ink-soft mt-6 space-y-5 text-[15px] leading-relaxed">
        <section>
          <h2 className="text-ink mb-1.5 text-lg font-bold">1. 수집하는 개인정보</h2>
          <p>
            신조어 판독기는 회원가입이 없으며, 이름·생년월일·연락처 등 개인을 식별할 수 있는
            정보를 <b className="text-ink">수집하거나 서버에 저장하지 않습니다</b>. 응시 중
            입력하는 닉네임과 실제 나이는 선택 항목이며, 결과 카드 표시와 갭 계산에만 쓰이고
            결과 링크(URL) 안에만 담깁니다.
          </p>
        </section>

        <section>
          <h2 className="text-ink mb-1.5 text-lg font-bold">2. 결과의 저장·공유 방식</h2>
          <p>
            테스트 결과는 데이터베이스에 저장하지 않습니다. 결과에 필요한 값(문제 시드·답안과
            선택 입력한 닉네임·실제 나이)은 URL에 인코딩되어, 그 링크를 가진 사람만 같은 결과를
            볼 수 있습니다. 링크를 공유하지 않으면 결과는 어디에도 남지 않습니다.
          </p>
        </section>

        <section>
          <h2 className="text-ink mb-1.5 text-lg font-bold">3. 방문 통계·광고</h2>
          <p>
            서비스 개선을 위해 익명·비식별 방문 통계(PostHog·Cloudflare Web Analytics)를 쿠키
            없이 수집할 수 있습니다. 이때 닉네임·실제 나이 같은 입력값은 전송하지 않으며,
            세대 구간 등 개인을 식별할 수 없는 값만 이용합니다. 광고가 게재될 경우 광고 제공사
            (예: 카카오 애드핏·Google 애드센스)가 자체 정책에 따라 쿠키 등을 사용할 수 있으며,
            이는 각 제공사의 정책을 따릅니다.
          </p>
        </section>

        <section>
          <h2 className="text-ink mb-1.5 text-lg font-bold">4. 제3자 제공·위탁</h2>
          <p>
            저장하는 개인정보가 없으므로 제3자에게 제공하거나 처리를 위탁하는 개인정보도
            없습니다.
          </p>
        </section>

        <section>
          <h2 className="text-ink mb-1.5 text-lg font-bold">5. 문의</h2>
          <p>
            개인정보 관련 문의는 운영자 이메일(fineboll67@gmail.com)로 연락해 주세요. 본 방침은
            법령·서비스 변경에 따라 개정될 수 있으며, 변경 시 본 페이지에 공지합니다.
          </p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/about" className="text-grape-deep font-semibold underline underline-offset-2">
          서비스 소개
        </Link>
        <Link href="/" className="text-grape-deep font-semibold underline underline-offset-2">
          판독 시작하기
        </Link>
      </div>
    </main>
  );
}
