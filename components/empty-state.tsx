"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTimeline } from "@/lib/timeline-context";
import type { TimelineEvent } from "@/lib/types";

export function EmptyState() {
  const [input, setInput] = useState("");
  const { addEvent, updateEvent } = useTimeline();

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

    const newEvent: TimelineEvent = {
      id: eventId,
      year: "",
      title: "Generando...",
      description,
      timestamp: undefined,
      dateConfirmed: false,
      position: { x: 100, y: 200 },
    };

    addEvent(newEvent);
    setInput("");

    const { title, year } = await generateEventData(description);
    updateEvent(eventId, {
      title,
      year: year ?? "",
      timestamp: year ? new Date(parseInt(year), 0, 1).getTime() : undefined,
      dateConfirmed: year !== null,
    });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-white/90">
            Your timeline is empty
          </h2>
          <p className="text-sm text-white/50">
            Drop your first idea and watch it grow
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full space-y-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your first event..."
            className="w-full bg-white/5 border-white/20 text-white placeholder:text-white/40 h-12 text-base"
            autoFocus
          />
          <Button
            type="submit"
            className="w-full h-12 bg-white/10 hover:bg-white/20 text-white"
          >
            Create Event
          </Button>
        </form>
      </div>
    </div>
  );
}
