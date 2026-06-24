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

FastAPI BE가 준비되면 환경변수만 설정하면 됩니다(코드 수정 없음):

```bash
# .env.local
NEXT_PUBLIC_API_BASE=http://localhost:8000
```

설정 시 `app/lib/api.ts`의 fetch가 mock 대신 이 주소로 직접 호출합니다(CORS). 미설정이면 mock 폴백. 자세한 키는 [.env.example](.env.example) 참고.

## 구조

```
app/
  api/                # mock 라우트 핸들러 (BE 붙으면 우회됨)
    conversations/[id]/messages/route.ts
    conversations/route.ts
    projects/route.ts
  components/         # ProjectSidebar · ChatPanel · EvidencePanel
  lib/
    types.ts          # 가이드 #0001 API 계약(한국어 키) 동결
    api.ts            # fetch 레이어 (NEXT_PUBLIC_API_BASE 기반)
    mock-data.ts      # mock 응답 데이터
    useConversation.ts# 대화 상태 훅
  page.tsx            # 3-패널 조립
```

기술 스택: Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4.
