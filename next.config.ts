import type { NextConfig } from "next";

// 실제 BE 주소(끝 슬래시 제거). 설정 시 /api/* 를 BE로 프록시한다.
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE ?? "").replace(/\/+$/, "");

const nextConfig: NextConfig = {
  // 같은 출처(localhost:3000) 프록시 → 익명 세션 쿠키(SameSite=lax)가
  // 1st-party 로 동작하고 CORS도 불필요. BE 미설정이면 mock 라우트가 처리.
  async rewrites() {
    if (!API_BASE) return [];
    return {
      // beforeFiles: mock 라우트 핸들러보다 먼저 잡아 BE로 보낸다.
      beforeFiles: [
        { source: "/api/:path*", destination: `${API_BASE}/api/:path*` },
      ],
    };
  },
};

export default nextConfig;
