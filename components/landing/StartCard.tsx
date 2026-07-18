"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { track, referrerType } from "@/lib/analytics";

/** 랜딩 — 실제 나이(선택) 입력 + 판독 시작 버튼. 입력 3초 컷. */
export function StartCard() {
  const router = useRouter();
  const [nick, setNick] = useState("");
  const [age, setAge] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    track("landing_view", { referrer_type: referrerType() });
  }, []);

  function start() {
    setLoading(true);
    const q = new URLSearchParams();
    const n = nick.trim().slice(0, 12);
    if (n) q.set("n", n);
    const a = age.replace(/\D/g, "").slice(0, 2);
    if (a && Number(a) >= 5) q.set("age", a);
    const qs = q.toString();
    router.push(`/quiz${qs ? `?${qs}` : ""}`);
  }

  return (
    <div className="sticker animate-fade-up mx-auto w-full max-w-md p-6 text-center">
      <p className="pixel text-candy-deep text-[13px]">LANGUAGE AGE TEST</p>
      <p className="text-ink-soft mt-2 text-sm font-medium">
        10문항 · 약 90초 · 최신 신조어로 보는 언어 나이
      </p>

      <label className="mt-5 block text-left">
        <span className="text-ink-soft text-xs font-medium">
          실제 나이 <span className="text-ink-faint">(선택 · 결과에서 갭 표시용, 저장 안 함)</span>
        </span>
        <input
          value={age}
          onChange={(e) => setAge(e.target.value.replace(/\D/g, "").slice(0, 2))}
          onKeyDown={(e) => e.key === "Enter" && start()}
          inputMode="numeric"
          placeholder="예: 27"
          className="border-ink/15 focus:border-candy mt-1 w-full rounded-xl border-2 bg-white px-4 py-3 text-base outline-none transition"
        />
      </label>

      <label className="mt-3 block text-left">
        <span className="text-ink-soft text-xs font-medium">
          닉네임 <span className="text-ink-faint">(선택 · 결과 카드 이름 칸)</span>
        </span>
        <input
          value={nick}
          onChange={(e) => setNick(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && start()}
          maxLength={12}
          placeholder="언어탐정"
          className="border-ink/15 focus:border-candy mt-1 w-full rounded-xl border-2 bg-white px-4 py-3 text-base outline-none transition"
        />
      </label>

      <button
        onClick={start}
        disabled={loading}
        className="bg-candy hover:bg-candy-deep mt-5 w-full rounded-xl border-2 border-ink px-6 py-4 text-lg font-bold text-white shadow-popsm transition active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
      >
        {loading ? "판독 준비 중…" : "판독 시작하기 🔍"}
      </button>
    </div>
  );
}
