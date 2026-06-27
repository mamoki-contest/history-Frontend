// FE/BE 분리 (ADR-0002). fetch 레이어 한 곳에 격리한다.
//
// 항상 같은 출처(/api/*)로 호출한다:
// - NEXT_PUBLIC_API_BASE 설정 시 → next.config.ts 의 rewrite 가 실제 BE로 프록시.
//   (같은 출처라 익명 세션 쿠키 SameSite=lax 가 동작하고 CORS도 불필요)
// - 미설정 시 → Next 라우트 핸들러 mock 이 처리(#0004 병렬 진행).
// 엔드포인트·스키마는 실제 BE openapi.json 기준.
import type {
  Conversation,
  ConversationCreated,
  MessageOut,
  MessageResponse,
  Project,
} from "./types";

// 기본: 상대경로(/api/*) 로 호출 → next.config.ts 의 rewrite 가 BE로 프록시한다(same-origin).
//  → 배포(Vercel)에서 CORS 불필요 + 익명 세션 쿠키가 1st-party(SameSite=lax)로 정상 동작.
// 로컬 WSL 에서 Next dev 프록시(undici)가 느린 /messages 에 ECONNRESET 을 내면,
//  .env.local 에 NEXT_PUBLIC_DIRECT_API=1 을 넣어 브라우저가 BE를 직접 호출하도록 우회한다.
const API_BASE =
  process.env.NEXT_PUBLIC_DIRECT_API === "1"
    ? (process.env.NEXT_PUBLIC_API_BASE ?? "")
    : "";
async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(API_BASE + path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    // 익명 세션(쿠키) 영속 — 무로그인 영속(ADR-0005)
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${await res.text().catch(() => "")}`);
  }
  // 201 등 본문 없는 응답 대비
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** 한 턴: 질문 전송 → answer | clarify */
export function sendMessage(
  conversationId: string,
  query: string,
  forceResults = false,
): Promise<MessageResponse> {
  return http<MessageResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: "POST",
      body: JSON.stringify({ query, force_results: forceResults }),
    },
  );
}

/** 대화 기록 로드 (대화 선택 시, #0008) */
export function getMessages(conversationId: string): Promise<MessageOut[]> {
  return http<MessageOut[]>(`/api/conversations/${conversationId}/messages`);
}

/** 좌측 리스트: 프로젝트 목록 (#0008) */
export function listProjects(): Promise<Project[]> {
  return http<Project[]>("/api/projects");
}

/** 좌측 리스트: 프로젝트별 대화 목록 (#0008) */
export function listConversations(projectId: string): Promise<Conversation[]> {
  return http<Conversation[]>(`/api/projects/${projectId}/conversations`);
}

/** 좌측 리스트: 세션 전체 대화(프로젝트 미소속 포함) — 새로고침 후 복원용 (#0008, 유저스토리 #14) */
export function listAllConversations(): Promise<Conversation[]> {
  return http<Conversation[]>("/api/conversations");
}

/** "새 대화" 시작 — 프로젝트 안에 생성 (#0008) */
export function createConversation(
  projectId: string,
): Promise<ConversationCreated> {
  return http<ConversationCreated>(
    `/api/projects/${projectId}/conversations`,
    { method: "POST" },
  );
}

/** 프로젝트 없이 대화 생성 — 빈 상태에서 첫 질문 시 자동 생성용 */
export function createStandaloneConversation(): Promise<ConversationCreated> {
  return http<ConversationCreated>("/api/conversations", { method: "POST" });
}
