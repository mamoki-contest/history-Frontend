// FE/BE 분리 (ADR-0002). fetch 레이어 한 곳에 격리해 BE 교체를 1줄로 만든다.
//
// - NEXT_PUBLIC_API_BASE 가 설정되면 실제 FastAPI BE(JSON + CORS)로 직접 호출.
// - 미설정이면 Next 라우트 핸들러 mock(/api/*)으로 폴백 — 가이드 #0004 병렬 진행.
import type {
  Conversation,
  MessageResponse,
  Project,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** BASE 가 있으면 BE 절대경로, 없으면 Next mock 상대경로 */
function url(path: string): string {
  return `${BASE}${path}`;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url(path), {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    // 익명 세션(쿠키) 영속 — 무로그인 영속(ADR-0005)
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  return res.json() as Promise<T>;
}

/** 한 턴: 질문 전송 → answer | clarify (가이드 #0001 계약) */
export function sendMessage(
  대화ID: string,
  입력: string,
): Promise<MessageResponse> {
  return http<MessageResponse>(`/api/conversations/${대화ID}/messages`, {
    method: "POST",
    body: JSON.stringify({ 입력 }),
  });
}

/** 좌측 리스트: 프로젝트 목록 (#0008) */
export function listProjects(): Promise<Project[]> {
  return http<Project[]>("/api/projects");
}

/** 좌측 리스트: 대화 목록 (#0008) */
export function listConversations(): Promise<Conversation[]> {
  return http<Conversation[]>("/api/conversations");
}

/** "새 대화" 시작 (#0008) */
export function createConversation(projectId: string): Promise<Conversation> {
  return http<Conversation>("/api/conversations", {
    method: "POST",
    body: JSON.stringify({ projectId }),
  });
}
