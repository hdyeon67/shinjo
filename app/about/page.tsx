import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "소개",
  description:
    "신조어 판독기는 최신 신조어와 레트로 유행어 10문항으로 내 '언어 나이'를 판독하는 재미 진단이에요. 만든 이유와 원칙을 소개합니다.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <Link href="/" className="text-ink-faint text-sm">
        ← 홈으로
      </Link>
      <h1 className="mt-3 text-3xl font-black text-ink">신조어 판독기 소개</h1>

      <div className="text-ink-soft mt-6 space-y-5 text-[15px] leading-relaxed">
        <p>
          <b className="text-ink">신조어 판독기</b>는 최신 신조어 10문항으로 내
          <b className="text-ink"> 언어 나이</b>와 세대 라벨을 판독하는 재미 진단이에요.
          약 90초면 끝나고, 이름·생일 같은 개인정보는 필요 없어요.
        </p>
        <p>
          유행 시기가 서로 다른 신조어를 맞히며, 최신 밈을 많이 알수록 언어 나이가 어리게,
          최신 흐름을 놓칠수록 지긋하게 계산돼요. 몸의 나이와 다른, 내 밈 감각의 나이를
          가볍게 확인하고 친구와 같은 문제로 대결하는 것이 핵심 재미예요.
        </p>
        <p>
          <b className="text-ink">이런 원칙으로 만들었어요.</b>
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <b className="text-ink">재미·참고용</b>: 이 진단은 언어 능력이나 세대를 규정하지
            않아요. 언어 나이는 재미로 보는 수치일 뿐, 어떤 세대도 깎아내리지 않도록 문구를
            다듬었어요.
          </li>
          <li>
            <b className="text-ink">개인정보 미저장</b>: 결과는 서버에 저장하지 않고 링크 안에만
            담겨요. 실제 나이·닉네임은 모두 선택이며, 갭과 카드 표시용으로만 쓰여요.
          </li>
          <li>
            <b className="text-ink">같은 링크 = 같은 문제</b>: 시작할 때 만들어진 문제 세트가
            링크에 담겨, 친구가 같은 문제로 도전할 수 있어요.
          </li>
        </ul>
        <p>
          신조어는 유행이 빠르게 바뀌는 만큼, 한물간 표현은 최신 표현으로 주기적으로 교체하고
          있어요. 뜻이 조금씩 변하기도 한다는 점은 너그럽게 봐주세요.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-sm">
        <Link href="/guide" className="text-grape-deep font-semibold underline underline-offset-2">
          판독 가이드
        </Link>
        <Link href="/privacy" className="text-grape-deep font-semibold underline underline-offset-2">
          개인정보처리방침
        </Link>
        <Link href="/" className="text-grape-deep font-semibold underline underline-offset-2">
          판독 시작하기
        </Link>
      </div>

      <p className="text-ink-faint mt-8 text-xs leading-relaxed">
        신조어 판독기는 EDEN APPWORKS가 만든 fineboll 서비스예요. 재미·참고용 진단입니다.
      </p>
    </main>
  );
}
