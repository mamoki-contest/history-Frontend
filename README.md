# 역사 고증 검색 — 프론트엔드

현대어로 물으면 국역 사료에서 맥락이 같은 근거를 찾아 출처와 함께 답하는 멀티턴 대화형 고증 검색의 **프론트엔드**입니다. (PRD: [가이드/0001](가이드/0001-history-verification-saas.md))

## 화면 (3-패널, 가이드 #0004)

- **좌**: 프로젝트별 대화 리스트 + "새 대화" (#0008)
- **중앙**: 대화 + 자유 입력창 + 후속/좁히기 칩 (#0005~#0007)
- **우**: 선택한 답변의 근거 자료 + 시각자료 (#0011, #0012)

## 실행

```bash
pnpm install   # 또는 npm install
pnpm dev       # http://localhost:3000
```

기본은 **mock 모드**입니다 — Next 라우트 핸들러(`app/api/*`)가 가이드 #0001 계약대로 응답을 흉내 냅니다. 다음을 입력해 동작을 확인할 수 있습니다:

- "측우기" 류 → 답변 + 근거 자료 + 시각자료
- "자격루" → 근거는 있으나 시각자료 없음(no-image fallback)
- "그건?" 등 짧은 입력 → 좁히기(clarify) 질문 + 후보
- "없는내용" → 환각 가드 "확인되지 않습니다"

## 실제 BE 연동

환경변수만 설정하면 mock 대신 실제 FastAPI BE로 직접 호출합니다(코드 수정 없음):

```bash
# .env (또는 .env.local)
NEXT_PUBLIC_API_BASE=http://xujong2.iptime.org
```

- 미설정이면 Next 라우트 핸들러 mock(`/api/*`)으로 폴백.
- 끝 슬래시(`/`)는 `app/lib/api.ts`가 자동으로 제거합니다.
- `NEXT_PUBLIC_*`은 dev 서버 시작 시점에 읽히므로, 값 변경 후 dev 서버를 재시작하세요.
- BE는 익명 세션 쿠키(ADR-0005)를 쓰므로 fetch는 `credentials: "include"`로 호출합니다. BE CORS가 해당 origin + `allow-credentials`를 허용해야 합니다(현재 `http://localhost:3000` 허용 확인됨).

> **스키마 주의:** 실제 BE는 **영어 키**(`answer, results, visuals, followups, confidence` / `mode: "answer"|"clarify"`)를 씁니다. 가이드 #0001 문서는 한국어 키였으나 실제 구현은 프로토타입 형태의 영어 키를 따릅니다. `app/lib/types.ts`는 실제 BE openapi.json 기준입니다.

## API 엔드포인트 (실제 BE openapi.json 기준)

| 메서드 | 경로 | 용도 |
|---|---|---|
| GET | `/api/projects` | 프로젝트 목록 |
| GET | `/api/projects/{project_id}/conversations` | 프로젝트별 대화 목록 |
| POST | `/api/projects/{project_id}/conversations` | 새 대화 → `{conversation_id}` |
| POST | `/api/conversations` | 프로젝트 없는 새 대화 → `{conversation_id}` |
| GET | `/api/conversations/{id}/messages` | 대화 기록 로드 |
| POST | `/api/conversations/{id}/messages` | 질문 `{query}` → answer \| clarify |

## 구조

```
app/
  api/                # mock 라우트 핸들러 (BE 붙으면 우회됨, 실제 BE 구조 미러링)
    conversations/route.ts
    conversations/[id]/messages/route.ts
    projects/route.ts
    projects/[project_id]/conversations/route.ts
  components/         # ProjectSidebar · ChatPanel · EvidencePanel
  lib/
    types.ts          # 실제 BE openapi 스키마(영어 키) 동결
    api.ts            # fetch 레이어 (NEXT_PUBLIC_API_BASE 기반)
    mock-data.ts      # mock 응답 데이터
    useConversation.ts# 대화 상태 훅 (빈 BE면 첫 질문 시 대화 자동 생성)
  page.tsx            # 3-패널 조립
```

기술 스택: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.
