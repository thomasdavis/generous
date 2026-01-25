"use client";

import { useChat } from "@ai-sdk/react";
import { Badge, Button } from "@generous/ui";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Virtuoso, type VirtuosoHandle } from "react-virtuoso";
import { useAppState } from "@/lib/app-state";
import {
  type ChatMessage,
  getChatMessageCount,
  getRecentChatHistory,
  saveChatMessages,
} from "@/lib/db";
import styles from "./Chat.module.css";
import { ToolResultRenderer } from "./ToolResultRenderer";

const MESSAGES_PER_PAGE = 30;

interface ComponentToolOutput {
  _isComponent: true;
  success: boolean;
  name: string;
  jsonl?: string;
  tree?: unknown;
  error?: string;
}

function isComponentOutput(output: unknown): output is ComponentToolOutput {
  return (
    typeof output === "object" &&
    output !== null &&
    "_isComponent" in output &&
    (output as ComponentToolOutput)._isComponent === true
  );
}

interface ToolPart {
  state: string;
  output: unknown;
}

function ToolPartHandler({
  part,
  toolName,
  onComponentCreated,
  isFromHistory,
}: {
  part: ToolPart;
  toolName: string;
  onComponentCreated?: (output: ComponentToolOutput) => void;
  isFromHistory?: boolean;
}) {
  const { state, output } = part;
  const hasNotified = useRef(false);

  useEffect(() => {
    // Don't create components for messages loaded from history - they already have persisted components
    if (isFromHistory) return;

    if (
      state === "output-available" &&
      isComponentOutput(output) &&
      output.success &&
      onComponentCreated &&
      !hasNotified.current
    ) {
      hasNotified.current = true;
      onComponentCreated(output);
    }
  }, [state, output, onComponentCreated, isFromHistory]);

  if (state !== "output-available") {
    return (
      <div className={styles.toolCall}>
        <div className={styles.toolSpinner} />
        <span>Running {toolName}...</span>
      </div>
    );
  }

  // For createComponent, show a success message instead of rendering
  if (isComponentOutput(output)) {
    if (output.success) {
      return (
        <div className={styles.toolCall} style={{ color: "#22c55e" }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>Added "{output.name}" to your dashboard</span>
        </div>
      );
    }
    return (
      <div className={styles.toolCall} style={{ color: "#ef4444" }}>
        <span>Failed to create component: {output.error}</span>
      </div>
    );
  }

  // Use json-render for other tool results
  return <ToolResultRenderer toolName={toolName} toolData={output} />;
}

// Message component for rendering a single message
function MessageItem({
  message,
  onComponentCreated,
  isFromHistory,
}: {
  message: ChatMessage | { id: string; role: string; parts?: unknown[] };
  onComponentCreated: (output: ComponentToolOutput) => void;
  isFromHistory?: boolean;
}) {
  const parts = "parts" in message ? message.parts : undefined;
  const content = "content" in message ? message.content : undefined;

  return (
    <div className={styles.message} data-role={message.role}>
      {parts?.map((part: unknown, i: number) => {
        const p = part as { type?: string; text?: string };
        if (p.type === "text" && p.text) {
          return (
            <div key={i} className={styles.messageContent}>
              {p.text}
            </div>
          );
        }
        if (p.type?.startsWith("tool-")) {
          const toolName = p.type.replace("tool-", "");
          return (
            <ToolPartHandler
              key={i}
              part={part as ToolPart}
              toolName={toolName}
              onComponentCreated={onComponentCreated}
              isFromHistory={isFromHistory}
            />
          );
        }
        return null;
      })}
      {!parts && content && <div className={styles.messageContent}>{content}</div>}
    </div>
  );
}

export function Chat() {
  const { addComponent } = useAppState();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadedHistory, setLoadedHistory] = useState<ChatMessage[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const isLoading = status === "streaming" || status === "submitted";
  const addedComponents = useRef<Set<string>>(new Set());
  const savedMessageIds = useRef<Set<string>>(new Set());

  // All messages combined (history + current session), with isFromHistory flag
  const allMessages = useMemo(() => {
    // Filter out history messages that are now in the current messages
    const currentIds = new Set(messages.map((m) => m.id));
    const filteredHistory = loadedHistory
      .filter((m) => !currentIds.has(m.id))
      .map((m) => ({ ...m, isFromHistory: true as const }));
    const currentMessages = messages.map((m) => ({ ...m, isFromHistory: false as const }));
    return [...filteredHistory, ...currentMessages];
  }, [loadedHistory, messages]);

  // Load initial chat history
  useEffect(() => {
    async function loadInitialHistory() {
      try {
        const count = await getChatMessageCount();
        const history = await getRecentChatHistory(MESSAGES_PER_PAGE);
        setLoadedHistory(history);
        setHasMore(count > history.length);
        setInitialLoadDone(true);

        // Mark these as already saved
        for (const msg of history) {
          savedMessageIds.current.add(msg.id);
        }
      } catch (err) {
        console.error("Failed to load chat history:", err);
        setInitialLoadDone(true);
      }
    }
    loadInitialHistory();
  }, []);

  // Save new messages to IndexedDB
  useEffect(() => {
    async function saveNewMessages() {
      const newMessages: ChatMessage[] = [];

      for (const msg of messages) {
        if (!savedMessageIds.current.has(msg.id)) {
          // Convert to our ChatMessage format
          const chatMsg: ChatMessage = {
            id: msg.id,
            role: msg.role as "user" | "assistant",
            content:
              msg.parts
                ?.filter((p) => typeof p === "object" && p !== null && "text" in p)
                .map((p) => (p as { text: string }).text)
                .join("") || "",
            parts: msg.parts,
            createdAt: Date.now(),
          };
          newMessages.push(chatMsg);
          savedMessageIds.current.add(msg.id);
        }
      }

      if (newMessages.length > 0) {
        await saveChatMessages(newMessages);
      }
    }

    // Only save when not streaming
    if (status === "ready" && messages.length > 0) {
      saveNewMessages();
    }
  }, [messages, status]);

  // Load more history when scrolling up
  const loadMoreHistory = useCallback(async () => {
    if (isLoadingMore || !hasMore || loadedHistory.length === 0) return;

    const oldestMessage = loadedHistory[0];
    if (!oldestMessage) return;

    setIsLoadingMore(true);
    try {
      const olderMessages = await getRecentChatHistory(MESSAGES_PER_PAGE, oldestMessage.createdAt);

      if (olderMessages.length === 0) {
        setHasMore(false);
      } else {
        // Mark as saved
        for (const msg of olderMessages) {
          savedMessageIds.current.add(msg.id);
        }
        setLoadedHistory((prev) => [...olderMessages, ...prev]);
        setHasMore(olderMessages.length === MESSAGES_PER_PAGE);
      }
    } catch (err) {
      console.error("Failed to load more history:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMore, loadedHistory]);

  const copyMessagesJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(allMessages, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0 && virtuosoRef.current) {
      virtuosoRef.current.scrollToIndex({
        index: allMessages.length - 1,
        behavior: "smooth",
      });
    }
  }, [messages.length, allMessages.length]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleComponentCreated = useCallback(
    async (output: ComponentToolOutput) => {
      // Dedupe by name+jsonl to avoid double-adding
      const key = `${output.name}-${output.jsonl?.substring(0, 50)}`;
      if (addedComponents.current.has(key)) return;
      addedComponents.current.add(key);

      await addComponent({
        name: output.name,
        jsonl: output.jsonl || "",
        tree: output.tree,
      });
    },
    [addComponent],
  );

  if (!initialLoadDone) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <span className="drag-handle" style={{ cursor: "grab" }}>
            <span className={styles.headerTitle}>
              Chat
              <Badge variant="accent" size="sm">
                AI
              </Badge>
            </span>
          </span>
        </div>
        <div className={styles.messages}>
          <div className={styles.empty}>
            <span className={styles.emptyText}>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className="drag-handle" style={{ cursor: "grab" }}>
          <span className={styles.headerTitle}>
            Chat
            <Badge variant="accent" size="sm">
              AI
            </Badge>
          </span>
        </span>
        <div style={{ display: "flex", gap: "4px" }}>
          {allMessages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={copyMessagesJson}>
              {copied ? "Copied!" : "Copy JSON"}
            </Button>
          )}
          {isLoading && (
            <Button variant="ghost" size="sm" onClick={stop}>
              Stop
            </Button>
          )}
        </div>
      </div>

      <div className={styles.messages}>
        {allMessages.length === 0 ? (
          <div className={styles.empty}>
            <svg
              className={styles.emptyIcon}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span className={styles.emptyText}>Try: "Build me a weather widget for Tokyo"</span>
          </div>
        ) : (
          <Virtuoso
            ref={virtuosoRef}
            style={{ height: "100%" }}
            data={allMessages}
            startReached={loadMoreHistory}
            initialTopMostItemIndex={allMessages.length - 1}
            followOutput="smooth"
            components={{
              Header: () =>
                isLoadingMore ? (
                  <div className={styles.loadingMore}>Loading more...</div>
                ) : hasMore ? (
                  <div className={styles.loadingMore}>Scroll up for more</div>
                ) : null,
              Footer: () =>
                isLoading && messages[messages.length - 1]?.role !== "assistant" ? (
                  <div className={styles.loading}>
                    <div className={styles.loadingDots}>
                      <span className={styles.loadingDot} />
                      <span className={styles.loadingDot} />
                      <span className={styles.loadingDot} />
                    </div>
                  </div>
                ) : null,
            }}
            itemContent={(_index, message) => (
              <MessageItem
                key={message.id}
                message={message}
                onComponentCreated={handleComponentCreated}
                isFromHistory={message.isFromHistory}
              />
            )}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className={styles.inputArea}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <Button type="submit" size="sm" disabled={isLoading || !input.trim()}>
          Send
        </Button>
      </form>
    </div>
  );
}
