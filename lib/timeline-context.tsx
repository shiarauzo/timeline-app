"use client";

import {
  createContext,
  useContext,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import type { TimelineEvent } from "./types";

type Action =
  | { type: "ADD_EVENT"; payload: TimelineEvent }
  | {
      type: "UPDATE_EVENT";
      payload: { id: string; updates: Partial<TimelineEvent> };
    }
  | { type: "REORDER_EVENTS"; payload: TimelineEvent[] };

function sortEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    if (a.timestamp === undefined && b.timestamp === undefined) return 0;
    if (a.timestamp === undefined) return 1;
    if (b.timestamp === undefined) return -1;
    return a.timestamp - b.timestamp;
  });
}

function timelineReducer(
  state: TimelineEvent[],
  action: Action,
): TimelineEvent[] {
  switch (action.type) {
    case "ADD_EVENT":
      return sortEvents([...state, action.payload]);
    case "UPDATE_EVENT": {
      const updated = state.map((event) =>
        event.id === action.payload.id
          ? { ...event, ...action.payload.updates }
          : event,
      );
      return sortEvents(updated);
    }
    case "REORDER_EVENTS":
      return action.payload;
    default:
      return state;
  }
}

interface TimelineContextValue {
  events: TimelineEvent[];
  addEvent: (event: TimelineEvent) => void;
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void;
  reorderEvents: (events: TimelineEvent[]) => void;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const TimelineContext = createContext<TimelineContextValue | null>(null);

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [events, dispatch] = useReducer(timelineReducer, []);
  const [zoom, setZoom] = useState(1);

  const addEvent = (event: TimelineEvent) => {
    dispatch({ type: "ADD_EVENT", payload: event });
  };

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    dispatch({ type: "UPDATE_EVENT", payload: { id, updates } });
  };

  const reorderEvents = (newEvents: TimelineEvent[]) => {
    dispatch({ type: "REORDER_EVENTS", payload: newEvents });
  };

  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const resetZoom = () => setZoom(1);

  return (
    <TimelineContext.Provider
      value={{
        events,
        addEvent,
        updateEvent,
        reorderEvents,
        zoom,
        zoomIn,
        zoomOut,
        resetZoom,
      }}
    >
      {children}
    </TimelineContext.Provider>
  );
}

export function useTimeline() {
  const context = useContext(TimelineContext);
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider");
  }
  return context;
}
