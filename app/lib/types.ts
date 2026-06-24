// 가이드 #0001 API 계약을 TS 타입으로 동결한다 — FE/BE 단일 진실.
// 한국어 키를 계약 그대로 사용한다(결정: 한국어 키 유지).

/** 근거 자료 한 건 (국역 사료 인용) */
export interface 근거자료 {
  서명: string;
  기사명: string;
  점수: number;
  본문: string;
}

/** 시각자료 한 건 (사전 검수된 문화유산 이미지) */
export interface 시각자료 {
  개체: string;
  이미지URL: string;
  출처: string;
  라이선스: string;
}

/** mode=answer 응답 — 한 답변(메시지)이 자기 자료를 묶어 보유한다(#0012) */
export interface AnswerResponse {
  mode: "answer";
  답변: string;
  근거자료: 근거자료[];
  시각자료: 시각자료[];
  후속질문: string[];
  신뢰도: number;
}

/** mode=clarify 응답 — 신뢰도 < 임계값일 때 되묻기(#0007) */
export interface ClarifyResponse {
  mode: "clarify";
  질문: string;
  후보: string[];
}

export type MessageResponse = AnswerResponse | ClarifyResponse;

/** 한 턴의 사용자 입력 */
export interface MessageRequest {
  입력: string;
}

// ── 클라이언트 측 대화 상태 모델 ───────────────────────────

/** 화면에 쌓이는 메시지 한 줄 */
export type ChatMessage =
  | { id: string; role: "user"; 입력: string }
  | ({ id: string; role: "assistant" } & AnswerResponse)
  | ({ id: string; role: "assistant" } & ClarifyResponse);

/** 좌측 리스트의 대화 (#0008) */
export interface Conversation {
  id: string;
  projectId: string;
  제목: string;
  updatedAt: string;
}

/** 좌측 리스트의 프로젝트 (#0008) */
export interface Project {
  id: string;
  이름: string;
}
