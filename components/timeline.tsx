"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useTimeline } from "@/lib/timeline-context";

export function Timeline() {
  const [isVisible, setIsVisible] = useState(false);
  const { events, updateEvent, zoom } = useTimeline();
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent, eventId: string) => {
    const event = events.find((ev) => ev.id === eventId);
    if (!event?.position) return;

    setDraggingId(eventId);
    setDragOffset({
      x: e.clientX / zoom - event.position.x,
      y: e.clientY / zoom - event.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingId) return;

    const newX = e.clientX / zoom - dragOffset.x;
    const newY = e.clientY / zoom - dragOffset.y;

    updateEvent(draggingId, {
      position: { x: Math.max(0, newX), y: Math.max(0, newY) },
    });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
  };

  const handleMouseLeave = () => {
    setDraggingId(null);
  };

  if (events.length === 0) {
    return null;
  }

  // Sort events by timestamp for connecting lines
  const sortedEvents = [...events]
    .filter((e) => e.position)
    .sort((a, b) => {
      if (a.timestamp === undefined && b.timestamp === undefined) return 0;
      if (a.timestamp === undefined) return 1;
      if (b.timestamp === undefined) return -1;
      return a.timestamp - b.timestamp;
    });

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[70vh] overflow-auto"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
    >
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div
        className="relative w-[2000px] h-[1500px] origin-top-left transition-transform duration-200"
        style={{ transform: `scale(${zoom})` }}
      >
        {/* SVG Lines connecting events */}
        {sortedEvents.length >= 2 && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {sortedEvents.slice(0, -1).map((event, index) => {
              const nextEvent = sortedEvents[index + 1];
              if (!event.position || !nextEvent.position) return null;

              return (
                <line
                  key={`line-${event.id}-${nextEvent.id}`}
                  x1={event.position.x + 75}
                  y1={event.position.y + 50}
                  x2={nextEvent.position.x + 75}
                  y2={nextEvent.position.y + 50}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  className={`transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
                />
              );
            })}
          </svg>
        )}

        {/* Events */}
        {events.map((event, index) => {
          if (!event.position) return null;

          return (
            <div
              key={event.id}
              onMouseDown={(e) => handleMouseDown(e, event.id)}
              className={`absolute w-[150px] p-3 rounded-lg border border-white/20 bg-black/60 backdrop-blur-sm cursor-grab active:cursor-grabbing select-none transition-all duration-300 ${
                isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } ${draggingId === event.id ? "shadow-lg shadow-white/10 z-50" : "z-10"}`}
              style={{
                left: event.position.x,
                top: event.position.y,
                transitionDelay: draggingId ? "0ms" : `${300 + index * 150}ms`,
              }}
            >
              <div className="text-center">
                <span className="mb-1 block text-lg font-bold text-white">
                  {event.year || "?"}
                </span>
                <h3 className="mb-1 text-sm font-semibold text-white">
                  {event.title}
                </h3>
                <p className="text-xs text-white/50 line-clamp-3">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
