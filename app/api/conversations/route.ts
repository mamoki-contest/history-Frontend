import { NextResponse } from "next/server";
import type { ConversationCreated } from "@/app/lib/types";

// POST /api/conversations  — 프로젝트 없는 새 대화 (실제 BE 스키마, mock)
// 201 + { conversation_id }
export async function POST() {
  const body: ConversationCreated = { conversation_id: `c${Date.now()}` };
  return NextResponse.json(body, { status: 201 });
}
