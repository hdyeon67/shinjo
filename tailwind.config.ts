import type { Config } from "tailwindcss";

// 신조어 판독기 디자인 토큰.
// 컨셉: 레트로 × 현재 믹스 — 싸이월드 Y2K 파스텔(핑크·라벤더·사이언) + 픽셀 포인트.
// 결과 카드의 주인공은 "언어 나이" 숫자(픽셀 폰트).
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // 파스텔 배경 계열
        cloud: {
          DEFAULT: "#fbf3ff", // 연보라 크림 배경
          soft: "#f3e6ff",
          deep: "#e7d3ff",
        },
        ink: {
          DEFAULT: "#2a2440", // 딥 퍼플-네이비 먹
          soft: "#5b5378",
          faint: "#8f88a8",
        },
        // Y2K 포인트
        candy: {
          DEFAULT: "#ff5fa2", // 핫핑크
          deep: "#e8408a",
        },
        grape: {
          DEFAULT: "#7c6cff", // 라벤더 퍼플
          deep: "#6353e6",
        },
        aqua: {
          DEFAULT: "#3bd6e6", // 사이언
          deep: "#22b8c8",
        },
        lemon: "#ffe14d",
      },
      fontFamily: {
        sans: ["Pretendard", "ui-sans-serif", "system-ui", "sans-serif"],
        // 픽셀 포인트(라틴·숫자 전용) — 싸이월드/Y2K 감성
        pixel: ["'Press Start 2P'", "'DungGeunMo'", "monospace"],
      },
      boxShadow: {
        pop: "5px 5px 0 0 rgba(42,36,64,0.16)",
        popsm: "3px 3px 0 0 rgba(42,36,64,0.16)",
        glow: "0 0 24px 0 rgba(255,95,162,0.35)",
      },
      backgroundImage: {
        // Y2K 파스텔 그라데이션 (핑크→라벤더→사이언)
        y2k: "linear-gradient(135deg,#ffd9ec 0%,#e7d3ff 45%,#cdf3f8 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
