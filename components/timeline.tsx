"use client";

import type React from "react";
import { useEffect, useState, useRef } from "react";
import { useTimeline } from "@/lib/timeline-context";
import type { TimelineEvent } from "@/lib/types";

export function Timeline() {
  const [isVisible, setIsVisible] = useState(false);
  const { events, updateEvent, addEvent, zoom } = useTimeline();

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [viewOffset, setViewOffset] = useState({ x: 100, y: 100 });
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Event drag state
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hasDragged, setHasDragged] = useState(false);

  // Selection state
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<
    "year" | "title" | "description" | null
  >(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (editingField === "description" && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    } else if (editingField && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingId, editingField]);

  // Start dragging an event
  const handleEventMouseDown = (e: React.MouseEvent, eventId: string) => {
    e.stopPropagation();
    const event = events.find((ev) => ev.id === eventId);
    if (!event?.position) return;

    // Don't start drag if we're editing
    if (editingId === eventId) return;

    setDraggingId(eventId);
    setHasDragged(false);
    setDragOffset({
      x: e.clientX - (event.position.x + viewOffset.x) * zoom,
      y: e.clientY - (event.position.y + viewOffset.y) * zoom,
    });
  };

  // Start panning the canvas
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Deselect when clicking on background
    setSelectedId(null);
    setEditingId(null);
    setEditingField(null);

    setIsPanning(true);
    setPanStart({
      x: e.clientX - viewOffset.x * zoom,
      y: e.clientY - viewOffset.y * zoom,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggingId) {
      setHasDragged(true);
      const newX = (e.clientX - dragOffset.x) / zoom - viewOffset.x;
      const newY = (e.clientY - dragOffset.y) / zoom - viewOffset.y;

      updateEvent(draggingId, {
        position: { x: newX, y: newY },
      });
    } else if (isPanning) {
      const newOffsetX = (e.clientX - panStart.x) / zoom;
      const newOffsetY = (e.clientY - panStart.y) / zoom;
      setViewOffset({ x: newOffsetX, y: newOffsetY });
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    // If we clicked on an event without dragging, select it
    if (draggingId && !hasDragged) {
      setSelectedId(draggingId);
    }
    setDraggingId(null);
    setIsPanning(false);
  };

  // Handle double click to edit
  const handleDoubleClick = (
    e: React.MouseEvent,
    eventId: string,
    field: "year" | "title" | "description",
  ) => {
    e.stopPropagation();
    const event = events.find((ev) => ev.id === eventId);
    if (!event) return;

    setEditingId(eventId);
    setEditingField(field);
    setEditValue(event[field] || "");
  };

  // Save edit
  const handleSaveEdit = () => {
    if (editingId && editingField) {
      updateEvent(editingId, { [editingField]: editValue });
    }
    setEditingId(null);
    setEditingField(null);
  };

  // Cancel edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingField(null);
  };

  // Handle key press in edit mode
  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && editingField !== "description") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Add new event next to selected
  const handleAddEvent = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const selectedEvent = events.find((ev) => ev.id === selectedId);
    if (!selectedEvent?.position) return;

    const newEventId = crypto.randomUUID();
    const newEvent: TimelineEvent = {
      id: newEventId,
      year: "",
      title: "New Event",
      description: "Click to edit",
      timestamp: undefined,
      dateConfirmed: false,
      position: {
        x: selectedEvent.position.x + 200,
        y: selectedEvent.position.y,
      },
    };

    addEvent(newEvent);
    setSelectedId(newEventId);
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

  // Calculate canvas bounds
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
      onMouseLeave={() => {
        setDraggingId(null);
        setIsPanning(false);
      }}
    >
      <div
        className="absolute"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
        }}
      >
        {/* SVG Lines */}
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
          const isSelected = selectedId === event.id;
          const isEditing = editingId === event.id;

          return (
            <div
              key={event.id}
              className="absolute"
              style={{
                left: event.position.x + viewOffset.x,
                top: event.position.y + viewOffset.y,
              }}
            >
              {/* Event Card */}
              <div
                onMouseDown={(e) => handleEventMouseDown(e, event.id)}
                className={`w-[150px] p-3 rounded-lg border bg-black/80 backdrop-blur-sm select-none transition-all duration-300 ${
                  isVisible ? "opacity-100" : "opacity-0"
                } ${isSelected ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-white/20"} ${
                  draggingId === event.id
                    ? "cursor-grabbing z-50"
                    : "cursor-grab z-10"
                }`}
                style={{
                  transitionDelay: draggingId
                    ? "0ms"
                    : `${100 + index * 100}ms`,
                }}
              >
                <div className="text-center space-y-1">
                  {/* Year */}
                  {isEditing && editingField === "year" ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleEditKeyDown}
                      className="w-full bg-white/10 border border-white/30 rounded px-1 text-lg font-bold text-white text-center"
                      placeholder="YYYY"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) =>
                        handleDoubleClick(e, event.id, "year")
                      }
                      className="block text-lg font-bold text-white cursor-text hover:bg-white/10 rounded px-1"
                    >
                      {event.year || "?"}
                    </span>
                  )}

                  {/* Title */}
                  {isEditing && editingField === "title" ? (
                    <input
                      ref={inputRef}
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={handleEditKeyDown}
                      className="w-full bg-white/10 border border-white/30 rounded px-1 text-sm font-semibold text-white text-center"
                      placeholder="Title"
                    />
                  ) : (
                    <h3
                      onDoubleClick={(e) =>
                        handleDoubleClick(e, event.id, "title")
                      }
                      className="text-sm font-semibold text-white cursor-text hover:bg-white/10 rounded px-1"
                    >
                      {event.title}
                    </h3>
                  )}

                  {/* Description */}
                  {isEditing && editingField === "description" ? (
                    <textarea
                      ref={textareaRef}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onBlur={handleSaveEdit}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") handleCancelEdit();
                      }}
                      className="w-full bg-white/10 border border-white/30 rounded px-1 text-xs text-white/70 resize-none"
                      rows={3}
                      placeholder="Description"
                    />
                  ) : (
                    <p
                      onDoubleClick={(e) =>
                        handleDoubleClick(e, event.id, "description")
                      }
                      className="text-xs text-white/50 line-clamp-3 cursor-text hover:bg-white/10 rounded px-1"
                    >
                      {event.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Add button - shows when selected */}
              {isSelected && !isEditing && (
                <button
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={handleAddEvent}
                  className="absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full w-8 h-8 rounded-full bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
                >
                  +
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
