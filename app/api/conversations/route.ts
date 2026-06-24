import { NextResponse } from "next/server";
import { mockConversations } from "@/app/lib/mock-data";
import type { Conversation } from "@/app/lib/types";

// GET /api/conversations  — 좌측 리스트 (#0008, mock)
export async function GET() {
  return NextResponse.json(mockConversations);
}

// POST /api/conversations  — "새 대화" 시작 (#0008, mock)
export async function POST(req: Request) {
  const { projectId } = (await req.json()) as { projectId: string };
  const conv: Conversation = {
    id: `c${Date.now()}`,
    projectId: projectId ?? "p1",
    제목: "새 대화",
    updatedAt: new Date().toISOString(),
  };
  return NextResponse.json(conv);
}
