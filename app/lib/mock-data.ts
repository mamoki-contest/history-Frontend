// mock 데이터 — BE 미연결(NEXT_PUBLIC_API_BASE 미설정) 시 폴백(#0004).
// 실제 BE openapi.json 스키마(영어 키)를 그대로 따른다. 주제: 조선 과학·발명.
import type {
  AnswerResponse,
  ClarifyResponse,
  Conversation,
  EvidenceItem,
  MessageResponse,
  Project,
  VisualItem,
} from "./types";

export const mockProjects: Project[] = [
  { id: "p1", name: "조선의 과학기구" },
  { id: "p2", name: "정조와 화성" },
];

export const mockConversations: Conversation[] = [
  { id: "c1", project_id: "p1", title: "측우기는 누가 만들었나" },
  { id: "c2", project_id: "p1", title: "자격루의 작동 원리" },
  { id: "c3", project_id: "p2", title: "거중기와 화성 축조" },
];

const 측우기근거: EvidenceItem[] = [
  {
    book: "세종실록",
    title: "세종 23년 4월 측우기를 만들다",
    score: 0.91,
    text:
      "호조에서 아뢰기를, 비가 내린 양을 헤아리기 위하여 쇠를 부어 그릇을 만들고 이를 서운관에 두어 빗물이 괸 깊이를 재게 하소서 하니, 그대로 따랐다. 길이 한 자 다섯 치, 지름 일곱 치의 그릇에 자[尺]를 세워 푼·치를 적게 하였다.",
  },
  {
    book: "세종실록",
    title: "세종 24년 5월 측우 제도를 정하다",
    score: 0.84,
    text:
      "각 도와 고을에 명하여 빗물의 깊이를 재어 보고하게 하니, 농사의 형편을 미리 헤아릴 수 있게 되었다. 서울은 서운관이, 지방은 수령이 맡아 기록하였다.",
  },
];

const 측우기시각: VisualItem[] = [
  {
    entity: "측우기",
    image_url:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Cheugugi.jpg/320px-Cheugugi.jpg",
    source: "국가유산청 / 위키미디어 공용",
    license: "공공누리 제1유형",
  },
];

function answer(
  text: string,
  results: EvidenceItem[],
  visuals: VisualItem[],
  followups: string[],
  confidence: number,
): AnswerResponse {
  return { mode: "answer", answer: text, results, visuals, followups, glossary: [], confidence };
}

const 확인불가: AnswerResponse = answer(
  "근거 자료에서 확인되지 않습니다.",
  [],
  [],
  ["측우기는 누가 만들었나요?", "자격루는 어떻게 시각을 알렸나요?"],
  0.12,
);

const 측우기답변: AnswerResponse = answer(
  "측우기는 세종 23년(1441) 빗물의 양을 재기 위해 쇠로 만든 그릇으로, 서운관에 두어 강우량을 측정하게 했습니다[세종실록]. 이듬해에는 각 도와 고을에서 빗물 깊이를 재어 보고하는 제도가 정해져, 전국 단위의 강우 관측 체계가 마련되었습니다[세종실록].",
  측우기근거,
  측우기시각,
  ["측우기의 규격은 어떻게 정해졌나요?", "지방에서는 누가 강우량을 쟀나요?", "측우기 이전에는 어떻게 비의 양을 알았나요?"],
  0.88,
);

// 근거는 있으나 시각자료 매칭 실패 → no-image fallback(#0011) 검증용
const 시각없음답변: AnswerResponse = answer(
  "자격루는 물의 흐름으로 시간을 재어 정해진 때마다 종·북·징이 저절로 울리도록 만든 자동 물시계입니다[세종실록]. 장영실 등이 제작하여 경복궁 보루각에 두었습니다[세종실록].",
  [
    {
      book: "세종실록",
      title: "세종 16년 7월 자격루를 새로 만들다",
      score: 0.86,
      text:
        "장영실에게 명하여 물시계를 새로 만드니, 시각이 되면 인형이 스스로 종과 북을 울려 사람의 손을 빌리지 않았다. 이를 보루각에 두었다.",
    },
  ],
  [], // 시각자료 없음
  ["장영실은 어떤 인물인가요?", "보루각은 어디에 있었나요?"],
  0.81,
);

const 좁히기: ClarifyResponse = {
  mode: "clarify",
  question: "어떤 과학기구에 대해 알고 싶으신가요?",
  suggestions: ["측우기(강우량 측정)", "자격루(물시계)", "혼천의(천문 관측)"],
};

/**
 * 입력 텍스트로 mock 분기.
 * - 짧거나 모호 → clarify (신뢰도 게이트 흉내, #0007)
 * - "자격루" → 근거는 있으나 이미지 없음 (no-image fallback, #0011)
 * - "측우기"/일반 → answer + 근거 + 시각자료
 * - "없는내용" → 환각 가드 "확인되지 않습니다"(#0005)
 */
export function mockReply(query: string): MessageResponse {
  const q = query.trim();
  if (q.length < 3 || /^(그건|그거|기구|그것)\??$/.test(q)) return 좁히기;
  if (q.includes("없는") || q.includes("외계인")) return 확인불가;
  if (q.includes("자격루") || q.includes("물시계")) return 시각없음답변;
  return 측우기답변;
}
