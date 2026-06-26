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

  const { results, visuals } = answer;
  const glossary = answer.glossary ?? [];
  const artifactInfo = answer.artifact_info ?? [];

  return (
    <aside className="h-full overflow-y-auto border-l border-line bg-card/40 px-5 py-5">
      {/* 시각자료 */}
      <h2 className="text-xs font-semibold tracking-wide text-muted">시각자료</h2>
      {visuals.length === 0 ? (
        // no-image fallback — 근거 텍스트는 그대로 유지(#0011)
        <p className="mt-2 rounded-lg border border-dashed border-line px-3 py-3 text-sm text-muted">
          이 답변엔 관련 시각자료가 없습니다.
        </p>
      ) : (
        <div className="mt-2 grid gap-3">
          {visuals.map((v, i) => (
            <figure
              key={`${v.entity}-${i}`}
              className="overflow-hidden rounded-xl border border-line bg-card"
            >
              {/* 다양한 문화유산 API 호스트의 이미지 → 도메인 비종속 위해 plain img 사용 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={v.image_url}
                alt={v.entity}
                className="h-44 w-full bg-accent-soft object-cover"
                loading="lazy"
              />
              <figcaption className="px-3 py-2">
                <div className="text-sm font-medium">{v.entity}</div>
                <div className="mt-0.5 text-xs text-muted">
                  {v.source} · {v.license}
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      {/* 유물 정보 — 답변 속 유물의 e뮤지엄 메타(시대·재질·출토지) */}
      {artifactInfo.length > 0 && (
        <>
          <h2 className="mt-6 text-xs font-semibold tracking-wide text-muted">
            유물 정보
          </h2>
          <div className="mt-2 space-y-2">
            {artifactInfo.map((a, i) => (
              <div
                key={`${a.entity}-${i}`}
                className="rounded-lg border border-line bg-card px-3 py-2"
              >
                <div className="text-sm font-medium">{a.entity}</div>
                <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-xs">
                  {a.era && (
                    <>
                      <dt className="text-muted">시대</dt>
                      <dd className="text-ink/90">{a.era}</dd>
                    </>
                  )}
                  {a.material && (
                    <>
                      <dt className="text-muted">재질</dt>
                      <dd className="text-ink/90">{a.material}</dd>
                    </>
                  )}
                  {a.origin && (
                    <>
                      <dt className="text-muted">출토</dt>
                      <dd className="text-ink/90">{a.origin}</dd>
                    </>
                  )}
                  {a.size && (
                    <>
                      <dt className="text-muted">크기</dt>
                      <dd className="text-ink/90">{a.size}</dd>
                    </>
                  )}
                  {a.category && (
                    <>
                      <dt className="text-muted">분류</dt>
                      <dd className="text-ink/90">{a.category}</dd>
                    </>
                  )}
                </dl>
                <div className="mt-1 text-[11px] text-muted">{a.source}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* 용어 풀이 — 답변 속 어려운 용어 (한국어기초사전 krdict) */}
      {glossary.length > 0 && (
        <>
          <h2 className="mt-6 text-xs font-semibold tracking-wide text-muted">
            용어 풀이
          </h2>
          <dl className="mt-2 space-y-2">
            {glossary.map((g, i) => (
              <div
                key={`${g.term}-${i}`}
                className="rounded-lg border border-line bg-card px-3 py-2"
              >
                <dt className="text-sm font-medium">
                  {g.word}
                  {g.origin && (
                    <span className="ml-1 text-xs text-muted">{g.origin}</span>
                  )}
                  {g.pos && (
                    <span className="ml-1.5 text-[11px] text-accent">{g.pos}</span>
                  )}
                </dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-ink/90">
                  {g.definition}
                </dd>
              </div>
            ))}
          </dl>
        </>
      )}

      {/* 근거 자료 */}
      <h2 className="mt-6 text-xs font-semibold tracking-wide text-muted">
        근거 자료{" "}
        <span className="font-normal">(신뢰도 {answer.confidence})</span>
      </h2>
      {results.length === 0 ? (
        <p className="mt-2 text-sm text-muted">관련 사료를 찾지 못했습니다.</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {results.map((r, i) => (
            <li key={`${r.book}-${i}`} className="py-3">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-accent">
                  {r.book} — {r.title}
                </span>
                <span className="shrink-0 text-[11px] text-muted">
                  {r.score}
                </span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-ink/90">
                {r.text}
              </p>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
