import { NextResponse } from "next/server";
import { mockConversations } from "@/app/lib/mock-data";
import type { ConversationCreated } from "@/app/lib/types";

// GET /api/projects/{project_id}/conversations  — 프로젝트별 대화 목록 (#0008, mock)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ project_id: string }> },
) {
  const { project_id } = await params;
  return NextResponse.json(
    mockConversations.filter((c) => c.project_id === project_id),
  );
}

// POST /api/projects/{project_id}/conversations  — "새 대화" 시작 (#0008, mock)
// 201 + { conversation_id }
export async function POST() {
  const body: ConversationCreated = { conversation_id: `c${Date.now()}` };
  return NextResponse.json(body, { status: 201 });
}
