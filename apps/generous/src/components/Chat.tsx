"use client";

import { useChat } from "@ai-sdk/react";
import { Badge, Button } from "@generous/ui";
import { DefaultChatTransport } from "ai";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppState } from "@/lib/app-state";
import styles from "./Chat.module.css";
import { ToolResultRenderer } from "./ToolResultRenderer";

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
}: {
  part: ToolPart;
  toolName: string;
  onComponentCreated?: (output: ComponentToolOutput) => void;
}) {
  const { state, output } = part;
  const hasNotified = useRef(false);

  useEffect(() => {
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
  }, [state, output, onComponentCreated]);

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
    } else {
      return (
        <div className={styles.toolCall} style={{ color: "#ef4444" }}>
          <span>Failed to create component: {output.error}</span>
        </div>
      );
    }
  }

  // Use json-render for other tool results
  return <ToolResultRenderer toolName={toolName} toolData={output} />;
}

export function Chat() {
  const { addComponent } = useAppState();
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), []);
  const { messages, sendMessage, status, stop } = useChat({
    transport,
  });

  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";
  const addedComponents = useRef<Set<string>>(new Set());

  const copyMessagesJson = async () => {
    await navigator.clipboard.writeText(JSON.stringify(messages, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
          {messages.length > 0 && (
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
        {messages.length === 0 ? (
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
          <>
            {messages.map((message) => (
              <div key={message.id} className={styles.message} data-role={message.role}>
                {message.parts?.map((part, i) => {
                  if (part.type === "text" && part.text) {
                    return (
                      <div key={i} className={styles.messageContent}>
                        {part.text}
                      </div>
                    );
                  }
                  if (part.type?.startsWith("tool-")) {
                    const toolName = part.type.replace("tool-", "");
                    return (
                      <ToolPartHandler
                        key={i}
                        part={part}
                        toolName={toolName}
                        onComponentCreated={handleComponentCreated}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className={styles.loading}>
                <div className={styles.loadingDots}>
                  <span className={styles.loadingDot} />
                  <span className={styles.loadingDot} />
                  <span className={styles.loadingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
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
