"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
} from "@/components/ui/message";
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble";
import {
  MessageScroller,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Spinner } from "@/components/ui/spinner";
import { Send } from "lucide-react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AiChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // TODO: connect to AI backend
    setTimeout(() => {
      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "This is a placeholder response.",
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex size-full flex-col">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">AI Chat</h2>
      </div>

      <MessageScrollerProvider>
        <MessageScroller className="flex-1 min-h-0">
          <MessageScrollerViewport className="px-4 py-4">
            <MessageGroup>
              {messages.map((msg) => (
                <Message
                  key={msg.id}
                  align={msg.role === "user" ? "end" : "start"}
                >
                  {msg.role === "assistant" && (
                    <MessageAvatar>AI</MessageAvatar>
                  )}
                  <MessageContent>
                    <Bubble variant={msg.role === "user" ? "default" : "secondary"}>
                      <BubbleContent>{msg.content}</BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              ))}
              {loading && (
                <Message align="start">
                  <MessageAvatar>AI</MessageAvatar>
                  <MessageContent>
                    <Bubble variant="secondary">
                      <BubbleContent>
                        <Spinner />
                      </BubbleContent>
                    </Bubble>
                  </MessageContent>
                </Message>
              )}
            </MessageGroup>
          </MessageScrollerViewport>
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="flex items-center gap-2 border-t p-3">
        <Input
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <Button size="icon-sm" onClick={handleSend} disabled={loading}>
          <Send />
        </Button>
      </div>
    </div>
  );
}
