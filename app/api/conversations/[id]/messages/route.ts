import { NextResponse } from "next/server";
import { mockReply } from "@/app/lib/mock-data";
import type { MessageRequest } from "@/app/lib/types";

// POST /api/conversations/{대화ID}/messages  (가이드 #0001 계약, mock)
// 실제 BE 붙으면 NEXT_PUBLIC_API_BASE 로 우회되어 이 핸들러는 타지 않는다.
export async function POST(req: Request) {
  const body = (await req.json()) as MessageRequest;
  const 입력 = body?.입력 ?? "";
  // 검색·생성 지연을 흉내 내 로딩 UI를 확인할 수 있게 한다.
  await new Promise((r) => setTimeout(r, 500));
  return NextResponse.json(mockReply(입력));
}
