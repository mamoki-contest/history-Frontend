"use client";

import { useCallback, useEffect, useState } from "react";
import {
  createConversation,
  createStandaloneConversation,
  getMessages,
  listConversations,
  listProjects,
  sendMessage,
} from "./api";
import type { ChatMessage, Conversation, MessageOut, Project } from "./types";

let seq = 0;
const newId = (p: string) => `${p}-${Date.now()}-${seq++}`;

/** 저장된 메시지(MessageOut) → 화면 메시지(ChatMessage). 기록엔 answer만 저장됨. */
function toChatMessage(m: MessageOut): ChatMessage {
  if (m.role === "user") return { id: m.id, role: "user", content: m.content };
  return {
    id: m.id,
    role: "assistant",
    mode: "answer",
    answer: m.content,
    results: m.results ?? [],
    visuals: m.visuals ?? [],
    followups: m.followups ?? [],
    confidence: m.confidence ?? 0,
  };
}

/**
 * 대화 한 건의 상태와 동작을 모은 훅.
 * - send: 입력창·칩 모두 같은 파이프라인(#0007)
 * - 새 answer가 오면 그 메시지를 자동 선택 → 우측이 최신 자료를 보여줌(#0012)
 * - selectedId 변경으로 과거 답변 자료로 교체(#0012)
 */
export function useConversation() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // 우측 패널이 보여줄 답변(메시지) id
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 좌측 리스트 로드 — 프로젝트 목록 → 프로젝트별 대화 (#0008)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const ps = await listProjects();
        if (cancelled) return;
        setProjects(ps);
        const lists = await Promise.all(
          ps.map((p) => listConversations(p.id).catch(() => [])),
        );
        if (cancelled) return;
        const all = lists.flat();
        setConversations(all);
        if (all.length && !activeConvId) setActiveConvId(all[0].id);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
    // 최초 1회만
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = useCallback(
    async (query: string) => {
      const text = query.trim();
      if (!text || loading) return;
      setError(null);
      setMessages((m) => [
        ...m,
        { id: newId("u"), role: "user", content: text },
      ]);
      setLoading(true);
      try {
        // 활성 대화가 없으면(빈 BE 등) 즉석에서 하나 만든다.
        let convId = activeConvId;
        if (!convId) {
          const { conversation_id } = await createStandaloneConversation();
          convId = conversation_id;
          setActiveConvId(conversation_id);
          setConversations((c) => [
            { id: conversation_id, project_id: null, title: text.slice(0, 20) },
            ...c,
          ]);
        }
        const res = await sendMessage(convId, text);
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
      const { conversation_id } = await createConversation(projectId);
      const conv: Conversation = {
        id: conversation_id,
        project_id: projectId,
        title: "새 대화",
      };
      setConversations((c) => [conv, ...c]);
      setActiveConvId(conversation_id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setMessages([]);
    setSelectedId(null);
  }, []);

  // 대화 선택 → 기록 로드 (#0008)
  const selectConversation = useCallback(async (id: string) => {
    setActiveConvId(id);
    setSelectedId(null);
    try {
      const history = await getMessages(id);
      const msgs = history.map(toChatMessage);
      setMessages(msgs);
      // 마지막 answer를 우측에 자동 표시
      const lastAnswer = [...msgs]
        .reverse()
        .find((m) => m.role === "assistant" && m.mode === "answer");
      if (lastAnswer) setSelectedId(lastAnswer.id);
    } catch {
      setMessages([]);
    }
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
