"use client"

import { createContext, useContext, useReducer, type ReactNode } from "react"
import type { TimelineEvent } from "./types"

const initialEvents: TimelineEvent[] = [
  {
    id: "1",
    year: "2020",
    title: "Project Launch",
    description: "Initial concept and development began",
    timestamp: new Date(2020, 0, 1).getTime(),
    dateConfirmed: true,
  },
  {
    id: "2",
    year: "2021",
    title: "Beta Release",
    description: "First public testing phase",
    timestamp: new Date(2021, 0, 1).getTime(),
    dateConfirmed: true,
  },
  {
    id: "3",
    year: "2022",
    title: "Global Expansion",
    description: "Reached 1 million users worldwide",
    timestamp: new Date(2022, 0, 1).getTime(),
    dateConfirmed: true,
  },
  {
    id: "4",
    year: "2023",
    title: "Major Update",
    description: "Introduced AI-powered features",
    timestamp: new Date(2023, 0, 1).getTime(),
    dateConfirmed: true,
  },
  {
    id: "5",
    year: "2024",
    title: "Industry Award",
    description: "Recognized as market leader",
    timestamp: new Date(2024, 0, 1).getTime(),
    dateConfirmed: true,
  },
]

type Action =
  | { type: "ADD_EVENT"; payload: TimelineEvent }
  | { type: "UPDATE_EVENT"; payload: { id: string; updates: Partial<TimelineEvent> } }
  | { type: "REORDER_EVENTS"; payload: TimelineEvent[] }

function sortEvents(events: TimelineEvent[]): TimelineEvent[] {
  return [...events].sort((a, b) => {
    // Events without timestamps go to the end
    if (a.timestamp === undefined && b.timestamp === undefined) return 0
    if (a.timestamp === undefined) return 1
    if (b.timestamp === undefined) return -1
    return a.timestamp - b.timestamp
  })
}

function timelineReducer(state: TimelineEvent[], action: Action): TimelineEvent[] {
  switch (action.type) {
    case "ADD_EVENT":
      return sortEvents([...state, action.payload])
    case "UPDATE_EVENT": {
      const updated = state.map((event) =>
        event.id === action.payload.id ? { ...event, ...action.payload.updates } : event
      )
      return sortEvents(updated)
    }
    case "REORDER_EVENTS":
      return action.payload
    default:
      return state
  }
}

interface TimelineContextValue {
  events: TimelineEvent[]
  addEvent: (event: TimelineEvent) => void
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void
  reorderEvents: (events: TimelineEvent[]) => void
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [events, dispatch] = useReducer(timelineReducer, initialEvents)

  const addEvent = (event: TimelineEvent) => {
    dispatch({ type: "ADD_EVENT", payload: event })
  }

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    dispatch({ type: "UPDATE_EVENT", payload: { id, updates } })
  }

  const reorderEvents = (newEvents: TimelineEvent[]) => {
    dispatch({ type: "REORDER_EVENTS", payload: newEvents })
  }

  return (
    <TimelineContext.Provider value={{ events, addEvent, updateEvent, reorderEvents }}>
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider")
  }
  return context
}
