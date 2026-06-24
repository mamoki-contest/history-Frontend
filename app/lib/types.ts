// 실제 BE의 openapi.json 스키마를 TS 타입으로 동결한다 — FE/BE 단일 진실.
// (영어 키. 가이드 #0001은 한국어 키였으나 실제 구현은 프로토타입 형태의 영어 키를 따른다.)

/** 근거 자료 한 건 (국역 사료 인용) — openapi EvidenceItem */
export interface EvidenceItem {
  book: string;
  title: string;
  score: number;
  text: string;
}

/** 시각자료 한 건 (사전 검수된 문화유산 이미지) — openapi VisualItem */
export interface VisualItem {
  entity: string;
  image_url: string;
  source: string;
  license: string;
}

/** mode=answer 응답 — openapi AnswerResponse */
export interface AnswerResponse {
  mode: "answer";
  answer: string | null;
  results: EvidenceItem[];
  visuals: VisualItem[];
  followups: string[];
  confidence: number;
}

/** mode=clarify 응답 — openapi ClarifyResponse */
export interface ClarifyResponse {
  mode: "clarify";
  question: string;
  suggestions: string[];
}

export type MessageResponse = AnswerResponse | ClarifyResponse;

/** 한 턴의 사용자 입력 — openapi MessageRequest */
export interface MessageRequest {
  query: string;
  force_results?: boolean;
}

/** 저장된 메시지 한 건 (대화 기록 로드용) — openapi MessageOut */
export interface MessageOut {
  id: string;
  role: "user" | "assistant";
  content: string;
  results?: EvidenceItem[];
  visuals?: VisualItem[];
  followups?: string[];
  confidence?: number | null;
}

/** 좌측 리스트의 프로젝트 — openapi ProjectOut */
export interface Project {
  id: string;
  name: string;
}

/** 좌측 리스트의 대화 — openapi ConversationOut */
export interface Conversation {
  id: string;
  project_id: string | null;
  title: string;
}

/** 대화 생성 응답 — openapi ConversationCreated */
export interface ConversationCreated {
  conversation_id: string;
}

// ── 클라이언트 측 화면 상태 모델 ───────────────────────────

/** 화면에 쌓이는 메시지 한 줄 */
export type ChatMessage =
  | { id: string; role: "user"; content: string }
  | ({ id: string; role: "assistant" } & AnswerResponse)
  | ({ id: string; role: "assistant" } & ClarifyResponse);
