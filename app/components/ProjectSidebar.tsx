"use client";

import type { Conversation, Project } from "@/app/lib/types";

interface Props {
  projects: Project[];
  conversations: Conversation[];
  activeConvId: string | null;
  onSelect: (id: string) => void;
  onNew: (projectId: string) => void;
}

// 좌 패널: 프로젝트별 대화 리스트 + "새 대화" (#0008)
export default function ProjectSidebar({
  projects,
  conversations,
  activeConvId,
  onSelect,
  onNew,
}: Props) {
  return (
    <aside className="flex h-full flex-col border-r border-line bg-card/60">
      <div className="border-b border-line px-4 py-4">
        <h1 className="text-base font-semibold">역사 고증 검색</h1>
        <p className="mt-0.5 text-xs text-muted">ITKC 국역 · 조선 과학·발명</p>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-3">
        {projects.map((p) => {
          const convs = conversations.filter((c) => c.project_id === p.id);
          return (
            <section key={p.id} className="mb-4">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-semibold tracking-wide text-muted">
                  {p.name}
                </span>
                <button
                  onClick={() => onNew(p.id)}
                  className="rounded-md px-1.5 text-lg leading-none text-accent hover:bg-accent-soft"
                  title="새 대화"
                  aria-label={`${p.name}에 새 대화`}
                >
                  +
                </button>
              </div>
              <ul className="mt-1">
                {convs.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        c.id === activeConvId
                          ? "bg-accent-soft font-medium text-ink"
                          : "text-ink/80 hover:bg-accent-soft/60"
                      }`}
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
                {convs.length === 0 && (
                  <li className="px-2.5 py-1 text-xs text-muted">대화 없음</li>
                )}
              </ul>
            </section>
          );
        })}

        {/* 프로젝트에 속하지 않은 대화(빈 BE에서 즉석 생성된 것 등) */}
        {(() => {
          const orphans = conversations.filter((c) => !c.project_id);
          if (orphans.length === 0) return null;
          return (
            <section className="mb-4">
              <div className="px-2 text-xs font-semibold tracking-wide text-muted">
                기타 대화
              </div>
              <ul className="mt-1">
                {orphans.map((c) => (
                  <li key={c.id}>
                    <button
                      onClick={() => onSelect(c.id)}
                      className={`w-full truncate rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                        c.id === activeConvId
                          ? "bg-accent-soft font-medium text-ink"
                          : "text-ink/80 hover:bg-accent-soft/60"
                      }`}
                    >
                      {c.title}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })()}
      </nav>
    </aside>
  );
}
