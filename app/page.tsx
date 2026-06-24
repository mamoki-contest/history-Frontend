"use client";

import ChatPanel from "./components/ChatPanel";
import EvidencePanel from "./components/EvidencePanel";
import ProjectSidebar from "./components/ProjectSidebar";
import { useConversation } from "./lib/useConversation";
import type { AnswerResponse } from "./lib/types";

export default function Home() {
  const c = useConversation();

  // 우측 패널이 보여줄 답변(메시지) — selectedId 가 가리키는 answer 메시지
  const selected = c.messages.find((m) => m.id === c.selectedId);
  const selectedAnswer =
    selected && selected.role === "assistant" && selected.mode === "answer"
      ? (selected as AnswerResponse)
      : null;

  return (
    <div className="grid h-screen grid-cols-1 md:grid-cols-[240px_1fr] lg:grid-cols-[240px_1fr_360px]">
      <div className="hidden md:block">
        <ProjectSidebar
          projects={c.projects}
          conversations={c.conversations}
          activeConvId={c.activeConvId}
          onSelect={c.selectConversation}
          onNew={c.startConversation}
        />
      </div>

      <ChatPanel
        messages={c.messages}
        loading={c.loading}
        error={c.error}
        selectedId={c.selectedId}
        onSelect={c.setSelectedId}
        onSend={c.send}
      />

      <div className="hidden lg:block">
        <EvidencePanel answer={selectedAnswer} />
      </div>
    </div>
  );
}
