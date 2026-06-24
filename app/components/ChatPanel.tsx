"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "@/app/lib/types";

interface Props {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onSend: (입력: string) => void;
}

// 칩: 클릭하면 입력 전송과 동일 파이프라인(#0007)
function Chip({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="m-0.5 rounded-full border border-line bg-accent-soft px-3 py-1.5 text-sm text-ink transition-colors hover:bg-line"
    >
      {text}
    </button>
  );
}

// 중앙 패널: 대화 + 자유 입력창 + 후속/좁히기 칩 (#0004~#0007)
export default function ChatPanel({
  messages,
  loading,
  error,
  selectedId,
  onSelect,
  onSend,
}: Props) {
  const [value, setValue] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function submit() {
    const v = value.trim();
    if (!v) return;
    onSend(v);
    setValue("");
  }

  return (
    <section className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-4">
          {messages.length === 0 && !loading && (
            <div className="mt-16 text-center text-muted">
              <p className="text-lg">현대어로 물어보세요.</p>
              <p className="mt-1 text-sm">
                정확한 역사 용어를 몰라도 맥락이 같은 사료를 찾아 답합니다.
              </p>
              <div className="mt-5 flex flex-wrap justify-center">
                <Chip text="비의 양은 어떻게 쟀나요?" onClick={() => onSend("비의 양은 어떻게 쟀나요?")} />
                <Chip text="자격루는 어떻게 시간을 알렸나요?" onClick={() => onSend("자격루는 어떻게 시간을 알렸나요?")} />
              </div>
            </div>
          )}

          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <div key={m.id} className="self-end max-w-[80%]">
                  <div className="rounded-2xl rounded-br-sm bg-accent px-4 py-2.5 text-[15px] text-white">
                    {m.입력}
                  </div>
                </div>
              );
            }
            if (m.mode === "clarify") {
              return (
                <div key={m.id} className="max-w-[90%] self-start">
                  <div className="rounded-2xl rounded-bl-sm border-l-4 border-accent bg-card px-4 py-3">
                    <div className="text-xs text-muted">질문을 조금 좁혀볼까요?</div>
                    <div className="mt-1 text-[15px]">{m.질문}</div>
                    <div className="mt-2 flex flex-wrap">
                      {m.후보.map((c) => (
                        <Chip key={c} text={c} onClick={() => onSend(c)} />
                      ))}
                    </div>
                  </div>
                </div>
              );
            }
            // answer — 클릭하면 우측 자료 교체(#0012)
            const selected = m.id === selectedId;
            return (
              <div key={m.id} className="max-w-[90%] self-start">
                <button
                  onClick={() => onSelect(m.id)}
                  className={`block w-full rounded-2xl rounded-bl-sm border-l-4 px-4 py-3 text-left transition-colors ${
                    selected
                      ? "border-accent bg-card ring-1 ring-accent/30"
                      : "border-line bg-card hover:border-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted">답변</span>
                    <span className="text-[11px] text-muted">
                      신뢰도 {m.신뢰도}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed">
                    {m.답변}
                  </p>
                  {!selected && (
                    <span className="mt-2 inline-block text-xs text-accent">
                      근거 자료·시각자료 보기 →
                    </span>
                  )}
                </button>
                {m.후속질문.length > 0 && (
                  <div className="mt-2">
                    <div className="px-1 text-xs text-muted">이어서 궁금할 만한 것</div>
                    <div className="mt-1 flex flex-wrap">
                      {m.후속질문.map((f) => (
                        <Chip key={f} text={f} onClick={() => onSend(f)} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="self-start">
              <div className="flex items-center gap-2.5 rounded-2xl border border-line bg-card px-4 py-3 text-sm text-muted">
                <span className="spinner" />
                근거 자료를 찾고 답변을 생성하는 중…
              </div>
            </div>
          )}

          {error && (
            <div className="self-start rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
              오류: {error}
            </div>
          )}
          <div ref={endRef} />
        </div>
      </div>

      <div className="border-t border-line bg-bg/80 px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            disabled={loading}
            rows={1}
            placeholder="예: 왕이 신하들과 유교 경전을 함께 공부한 자리"
            className="flex-1 resize-none rounded-xl border border-line bg-card px-4 py-3 text-[15px] outline-none focus:border-accent disabled:opacity-60"
          />
          <button
            onClick={submit}
            disabled={loading || !value.trim()}
            className="rounded-xl bg-accent px-5 py-3 text-[15px] text-white transition-opacity disabled:opacity-50"
          >
            보내기
          </button>
        </div>
      </div>
    </section>
  );
}
