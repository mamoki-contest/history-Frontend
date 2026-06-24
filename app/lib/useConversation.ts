"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  listConversations,
  listProjects,
  sendMessage,
} from "./api";
import type { ChatMessage, Conversation, Project } from "./types";

let seq = 0;
const newId = (p: string) => `${p}-${Date.now()}-${seq++}`;

/**
 * 대화 한 건의 상태와 동작을 모은 훅.
 * - send: 입력창·칩 모두 같은 파이프라인(#0007)
 * - 새 answer가 오면 그 메시지를 자동 선택 → 우측이 최신 자료를 보여줌(#0012)
 * - selectedId 변경으로 과거 답변 자료로 교체(#0012)
 */
export function useConversation() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("c1");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 우측 패널이 보여줄 답변(메시지) id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 좌측 리스트 로드 (#0008)
  useEffect(() => {
    listProjects().then(setProjects).catch(() => {});
    listConversations().then(setConversations).catch(() => {});
  }, []);

  const send = useCallback(
    async (입력: string) => {
      const text = 입력.trim();
      if (!text || loading) return;
      setError(null);
      setMessages((m) => [
        ...m,
        { id: newId("u"), role: "user", 입력: text },
      ]);
      setLoading(true);
      try {
        const res = await sendMessage(activeConvId, text);
        const id = newId("a");
        setMessages((m) => [...m, { id, role: "assistant", ...res }]);
        // 새 answer면 우측을 최신 자료로 자동 전환(#0011, #0012)
        if (res.mode === "answer") setSelectedId(id);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    },
    [activeConvId, loading],
  );

  // "새 대화" 시작 (#0008)
  const startConversation = useCallback(async (projectId: string) => {
    try {
      const conv = await createConversation(projectId);
      setConversations((c) => [conv, ...c]);
      setActiveConvId(conv.id);
    } catch {
      /* mock 폴백 */
    }
    setMessages([]);
    setSelectedId(null);
  }, []);

  // 대화 선택 → 로드 (#0008). mock 단계라 메시지는 비워서 새로 시작.
  const selectConversation = useCallback((id: string) => {
    setActiveConvId(id);
    setMessages([]);
    setSelectedId(null);
  }, []);

  return {
    projects,
    conversations,
    activeConvId,
    messages,
    loading,
    error,
    selectedId,
    setSelectedId,
    send,
    startConversation,
    selectConversation,
  };
}
