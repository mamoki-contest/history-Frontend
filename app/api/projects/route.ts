import { NextResponse } from "next/server";
import { mockProjects } from "@/app/lib/mock-data";

// GET /api/projects  — 좌측 프로젝트 목록 (실제 BE 스키마, mock)
export async function GET() {
  return NextResponse.json(mockProjects);
}
