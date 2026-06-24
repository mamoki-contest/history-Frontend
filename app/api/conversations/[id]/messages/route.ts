import { NextResponse } from "next/server";
import { mockReply } from "@/app/lib/mock-data";
import type { MessageOut, MessageRequest } from "@/app/lib/types";

// POST /api/conversations/{id}/messages  (실제 BE 스키마, mock)
// 실제 BE 붙으면 NEXT_PUBLIC_API_BASE 로 우회되어 이 핸들러는 타지 않는다.
export async function POST(req: Request) {
  const body = (await req.json()) as MessageRequest;
  const query = body?.query ?? "";
  // 검색·생성 지연을 흉내 내 로딩 UI를 확인할 수 있게 한다.
  await new Promise((r) => setTimeout(r, 500));
  return NextResponse.json(mockReply(query));
}

// GET /api/conversations/{id}/messages  — 대화 기록 로드 (#0008, mock)
// mock 단계라 빈 기록을 반환(새로 시작).
export async function GET() {
  return NextResponse.json([] as MessageOut[]);
}
