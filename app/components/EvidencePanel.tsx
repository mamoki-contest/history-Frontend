"use client";

import type { AnswerResponse } from "@/app/lib/types";

interface Props {
  // 선택된 답변 메시지(없으면 안내). clarify/user는 자료가 없으므로 answer만 받는다.
  answer: AnswerResponse | null;
}

// 우 패널: 선택된 답변의 근거 자료 + 시각자료 (#0011, #0012)
export default function EvidencePanel({ answer }: Props) {
  if (!answer) {
    return (
      <aside className="flex h-full items-center justify-center border-l border-line bg-card/40 px-6 text-center text-sm text-muted">
        답변을 선택하면 그 근거 자료와 시각자료가 여기에 표시됩니다.
      </aside>
    );
  }

  const { 근거자료, 시각자료 } = answer;

  return (
    <aside className="h-full overflow-y-auto border-l border-line bg-card/40 px-5 py-5">
      {/* 시각자료 */}
      <h2 className="text-xs font-semibold tracking-wide text-muted">시각자료</h2>
      {시각자료.length === 0 ? (
        // no-image fallback — 근거 텍스트는 그대로 유지(#0011)
        <p className="mt-2 rounded-lg border border-dashed border-line px-3 py-3 text-sm text-muted">
          이 답변엔 관련 시각자료가 없습니다.
        </p>
      ) : (
        <div className="mt-2 grid gap-3">
          {시각자료.map((v, i) => (
            <figure
              key={`${v.개체}-${i}`}
              className="overflow-hidden rounded-xl border border-line bg-card"
            >
              {/* 다양한 문화유산 API 호스트의 이미지 → 도메인 비종속 위해 plain img 사용 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.이미지URL}
                alt={v.개체}
                className="h-44 w-full bg-accent-soft object-cover"
                loading="lazy"
              />
              <figcaption className="px-3 py-2">
                <div className="text-sm font-medium">{v.개체}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {v.출처} · {v.라이선스}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* 근거 자료 */}
      <h2 className="mt-6 text-xs font-semibold tracking-wide text-muted">
        근거 자료{" "}
        <span className="font-normal">(신뢰도 {answer.신뢰도})</span>
      </h2>
      {근거자료.length === 0 ? (
        <p className="mt-2 text-sm text-muted">관련 사료를 찾지 못했습니다.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {근거자료.map((r, i) => (
            <li key={`${r.서명}-${i}`} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-accent">
                  {r.서명} — {r.기사명}
                </span>
                <span className="shrink-0 text-[11px] text-muted">
                  {r.점수}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
                {r.본문}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
