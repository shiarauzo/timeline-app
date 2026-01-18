"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTimeline } from "@/lib/timeline-context";
import type { TimelineEvent } from "@/lib/types";

interface ChatMessage {
  id: string;
  text: string;
  eventId: string;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [yearInput, setYearInput] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const { events, addEvent, updateEvent } = useTimeline();

  const generateEventData = async (
    description: string,
  ): Promise<{ title: string; year: string | null }> => {
    try {
      const res = await fetch("/api/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      if (!res.ok) throw new Error("Failed to generate title");
      const data = await res.json();
      return {
        title: data.title || description.slice(0, 50),
        year: data.year || null,
      };
    } catch {
      return {
        title:
          description.length > 50
            ? description.slice(0, 50) + "..."
            : description,
        year: null,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const eventId = crypto.randomUUID();
    const description = input;

    // Calculate position for new event (offset from previous events)
    const existingCount = events.length;
    const baseX = 400 + (existingCount % 4) * 200;
    const baseY = 300 + Math.floor(existingCount / 4) * 180;

    const newEvent: TimelineEvent = {
      id: eventId,
      year: "",
      title: "Generando...",
      description,
      timestamp: undefined,
      dateConfirmed: false,
      position: { x: baseX, y: baseY },
    };

    addEvent(newEvent);
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), text: description, eventId },
    ]);
    setInput("");

    const { title, year } = await generateEventData(description);
    updateEvent(eventId, {
      title,
      year: year ?? "",
      timestamp: year ? new Date(parseInt(year), 0, 1).getTime() : undefined,
      dateConfirmed: year !== null,
    });
  };

  const handleYearSubmit = (eventId: string) => {
    const year = yearInput.trim();
    if (!year.match(/^(19|20)\d{2}$/)) return;

    updateEvent(eventId, {
      year,
      timestamp: new Date(parseInt(year), 0, 1).getTime(),
      dateConfirmed: true,
    });
    setEditingEventId(null);
    setYearInput("");
  };

  const getEventForMessage = (eventId: string) => {
    return events.find((e) => e.id === eventId);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 rounded-lg border border-white/20 bg-black/80 backdrop-blur-sm">
      <button
        onClick={() => setIsMinimized(!isMinimized)}
        className="w-full p-3 border-b border-white/10 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <span className="text-sm text-white/70">Add to timeline</span>
        <span className="text-white/50 text-xs">{isMinimized ? "+" : "−"}</span>
      </button>

      {!isMinimized && (
        <>
          <ScrollArea className="h-64 p-3">
            <div className="space-y-3">
              {messages.map((message) => {
                const event = getEventForMessage(message.eventId);
                const needsDate = event && !event.dateConfirmed;

                return (
                  <div key={message.id} className="text-sm">
                    <p className="text-white/90">{message.text}</p>
                    {needsDate && (
                      <div className="mt-1">
                        {editingEventId === message.eventId ? (
                          <div className="flex gap-1">
                            <Input
                              value={yearInput}
                              onChange={(e) => setYearInput(e.target.value)}
                              placeholder="YYYY"
                              className="h-7 w-20 text-xs bg-white/5 border-white/20"
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleYearSubmit(message.eventId);
                                if (e.key === "Escape") setEditingEventId(null);
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-white/70"
                              onClick={() => handleYearSubmit(message.eventId)}
                            >
                              Set
                            </Button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingEventId(message.eventId);
                              setYearInput("");
                            }}
                            className="text-xs text-blue-400 hover:text-blue-300"
                          >
                            + Add year
                          </button>
                        )}
                      </div>
                    )}
                    {event?.dateConfirmed && event.year && (
                      <span className="text-xs text-white/40">
                        {event.year}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          <form
            onSubmit={handleSubmit}
            className="flex gap-2 p-3 border-t border-white/10"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe an event..."
              className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
            />
            <Button type="submit" size="sm" variant="secondary">
              Add
            </Button>
          </form>
        </>
      )}
    </div>
  );
}
