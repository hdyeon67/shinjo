"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "@/lib/analytics";
import { PngSaveButton } from "./PngSaveButton";
import { KakaoShareButton } from "./KakaoShareButton";

/** 결과 공유·CTA 액션 — 도전장/링크복사/PNG 저장/카카오(env)/친구 판독 CTA. */
export function ResultActions({
  seed,
  shareTitle,
  shareDesc,
}: {
  seed: number;
  shareTitle: string;
  shareDesc: string;
}) {
  const router = useRouter();
  const [copied, setCopied] = useState<"result" | "challenge" | null>(null);

  async function copy(kind: "result" | "challenge") {
    const url =
      kind === "result"
        ? window.location.href
        : `${window.location.origin}/quiz?s=${seed >>> 0}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(kind);
      track("share_click", { channel: kind === "result" ? "copy_result" : "copy_challenge" });
      setTimeout(() => setCopied(null), 1800);
    } catch {
      /* 클립보드 차단 환경 — 무시 */
    }
  }

  return (
    <div className="mt-6 space-y-2.5">
      <button
        onClick={() => copy("challenge")}
        className="bg-grape hover:bg-grape-deep w-full rounded-xl border-2 border-ink px-5 py-3.5 text-base font-bold text-white shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
      >
        {copied === "challenge" ? "링크 복사됨! 친구에게 보내기 📨" : "친구에게 같은 문제 도전장 ⚔️"}
      </button>

      {/* 카카오 공유 (JS 키 있을 때만 노출) */}
      <KakaoShareButton title={shareTitle} description={shareDesc} />

      {/* PNG 저장 — 9:16 스토리 / 1:1 피드 */}
      <div className="grid grid-cols-2 gap-2.5">
        <PngSaveButton fmt="story" label="카드 저장 (스토리 9:16)" />
        <PngSaveButton fmt="feed" label="카드 저장 (피드 1:1)" />
      </div>

      <div className="flex gap-2.5">
        <button
          onClick={() => copy("result")}
          className="border-ink/15 hover:border-candy flex-1 rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold text-ink transition"
        >
          {copied === "result" ? "복사됨 ✅" : "결과 링크 복사 🔗"}
        </button>
        <button
          onClick={() => {
            track("cta_friend_click", {});
            router.push("/");
          }}
          className="border-ink/15 hover:border-candy flex-1 rounded-xl border-2 bg-white px-4 py-3 text-sm font-bold text-ink transition"
        >
          내 친구도 판독 🔍
        </button>
      </div>
    </div>
  );
}
