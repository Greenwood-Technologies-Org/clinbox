"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Send, Loader2 } from "lucide-react";
import { getIconProps } from "@/lib/icon-utils";
import { useEffect, useRef, useState } from "react";

interface ChatPanelProps {
  onClose?: () => void;
}

export default function ChatPanel({ onClose }: ChatPanelProps) {
  // Manage input state ourselves since useChat doesn't provide it
  const [input, setInput] = useState("");

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
    }),
  });

  const { messages, sendMessage, status, error } = chat;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === "streaming" || status === "submitted";

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage({ role: "user", content: input } as any);
      setInput(""); // Clear input after sending
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-400">
              Start a conversation with the AI assistant
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">
                  {(() => {
                    // Handle UIMessage format with parts
                    if (
                      (message as any).parts &&
                      Array.isArray((message as any).parts)
                    ) {
                      const textParts = (message as any).parts
                        .filter((p: any) => p.type === "text" && p.text)
                        .map((p: any) => p.text)
                        .join("");
                      return textParts || "";
                    }
                    // Handle direct text/content
                    return (
                      (message as any).text || (message as any).content || ""
                    );
                  })()}
                </p>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg px-4 py-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-sm text-red-600">
                Error: {error.message || "Failed to send message"}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <div className="border-t border-gray-200 p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input ?? ""}
            onChange={handleChange}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={isLoading || !(input ?? "").trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
