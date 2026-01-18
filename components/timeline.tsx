"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useTimeline } from "@/lib/timeline-context";

export function Timeline() {
  const [isVisible, setIsVisible] = useState(false);
  const { events, updateEvent, zoom } = useTimeline();

  // Pan state (dragging the canvas background)
  const [isPanning, setIsPanning] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 100, y: 100 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Event drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Start dragging an event
  const handleEventMouseDown = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const event = events.find((ev) => ev.id === eventId);
    if (!event?.position) return;

    setDraggingId(eventId);
    setDragOffset({
      x: e.clientX - (event.position.x + viewOffset.x) * zoom,
      y: e.clientY - (event.position.y + viewOffset.y) * zoom,
    });
  };

  // Start panning the canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    setPanStart({
      x: e.clientX - viewOffset.x * zoom,
      y: e.clientY - viewOffset.y * zoom,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      // Dragging an event
      const event = events.find((ev) => ev.id === draggingId);
      if (!event) return;

      const newX = (e.clientX - dragOffset.x) / zoom - viewOffset.x;
      const newY = (e.clientY - dragOffset.y) / zoom - viewOffset.y;

      updateEvent(draggingId, {
        position: { x: newX, y: newY },
      });
    } else if (isPanning) {
      // Panning the canvas
      const newOffsetX = (e.clientX - panStart.x) / zoom;
      const newOffsetY = (e.clientY - panStart.y) / zoom;
      setViewOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setIsPanning(false);
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

  // Calculate canvas bounds based on events
  const minX =
    Math.min(...events.filter((e) => e.position).map((e) => e.position!.x)) -
    500;
  const maxX =
    Math.max(...events.filter((e) => e.position).map((e) => e.position!.x)) +
    500;
  const minY =
    Math.min(...events.filter((e) => e.position).map((e) => e.position!.y)) -
    500;
  const maxY =
    Math.max(...events.filter((e) => e.position).map((e) => e.position!.y)) +
    500;

  return (
    <div
      className={`fixed inset-0 overflow-hidden ${isPanning ? "cursor-grabbing" : "cursor-grab"}`}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Canvas layer */}
      <div
        className="absolute"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* SVG Lines connecting events */}
        <svg
          className="absolute pointer-events-none"
          style={{
            left: minX + viewOffset.x,
            top: minY + viewOffset.y,
            width: maxX - minX + 200,
            height: maxY - minY + 200,
          }}
        >
          {sortedEvents.length >= 2 &&
            sortedEvents.slice(0, -1).map((event, index) => {
              const nextEvent = sortedEvents[index + 1];
              if (!event.position || !nextEvent.position) return null;

              return (
                <line
                  key={`line-${event.id}-${nextEvent.id}`}
                  x1={event.position.x - minX + 75}
                  y1={event.position.y - minY + 60}
                  x2={nextEvent.position.x - minX + 75}
                  y2={nextEvent.position.y - minY + 60}
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                  className={`transition-opacity duration-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}
                />
              );
            })}
        </svg>

        {/* Events */}
        {events.map((event, index) => {
          if (!event.position) return null;

          return (
            <div
              key={event.id}
              onMouseDown={(e) => handleEventMouseDown(e, event.id)}
              className={`absolute w-[150px] p-3 rounded-lg border border-white/20 bg-black/80 backdrop-blur-sm select-none transition-opacity duration-300 ${
                isVisible ? "opacity-100" : "opacity-0"
              } ${draggingId === event.id ? "cursor-grabbing shadow-lg shadow-white/20 z-50 border-white/40" : "cursor-grab z-10"}`}
              style={{
                left: event.position.x + viewOffset.x,
                top: event.position.y + viewOffset.y,
                transitionDelay: draggingId ? "0ms" : `${100 + index * 100}ms`,
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
