"use client"

import type React from "react"
import { useEffect, useState } from "react"

interface TimelineEvent {
  id: string
  year: string
  title: string
  description: string
}

const initialEvents: TimelineEvent[] = [
  {
    id: "1",
    year: "2020",
    title: "Project Launch",
    description: "Initial concept and development began",
  },
  {
    id: "2",
    year: "2021",
    title: "Beta Release",
    description: "First public testing phase",
  },
  {
    id: "3",
    year: "2022",
    title: "Global Expansion",
    description: "Reached 1 million users worldwide",
  },
  {
    id: "4",
    year: "2023",
    title: "Major Update",
    description: "Introduced AI-powered features",
  },
  {
    id: "5",
    year: "2024",
    title: "Industry Award",
    description: "Recognized as market leader",
  },
]

export function Timeline() {
  const [isVisible, setIsVisible] = useState(false)
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", id)
    // Make drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5"
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedId(null)
    setDragOverId(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "1"
    }
  }

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (id !== draggedId) {
      setDragOverId(id)
    }
  }

  const handleDragLeave = () => {
    setDragOverId(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    const sourceId = e.dataTransfer.getData("text/plain")

    if (sourceId === targetId) {
      setDragOverId(null)
      return
    }

    // Reorder events
    const sourceIndex = events.findIndex((event) => event.id === sourceId)
    const targetIndex = events.findIndex((event) => event.id === targetId)

    const newEvents = [...events]
    const [removed] = newEvents.splice(sourceIndex, 1)
    newEvents.splice(targetIndex, 0, removed)

    setEvents(newEvents)
    setDragOverId(null)
  }

  return (
    <div className="relative w-full overflow-x-auto py-12" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
      {/* Hide webkit scrollbar */}
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Timeline line */}
      <div className="relative min-w-[900px] px-8 md:px-16">
        <div
          className={`absolute top-1/2 left-8 right-8 h-px bg-white/30 transition-all duration-1000 ease-out md:left-16 md:right-16 ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: "translateY(-50%)" }}
        />

        {/* Timeline events */}
        <div className="relative flex justify-between">
          {events.map((event, index) => (
            <div
              key={event.id}
              draggable
              onDragStart={(e) => handleDragStart(e, event.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, event.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, event.id)}
              className={`relative flex flex-col items-center transition-all duration-300 ease-out cursor-grab active:cursor-grabbing select-none ${
                isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
              } ${draggedId === event.id ? "opacity-50" : ""} ${dragOverId === event.id ? "scale-105" : ""}`}
              style={{
                transitionDelay: draggedId ? "0ms" : `${300 + index * 200}ms`,
              }}
            >
              {/* Top content (alternating) */}
              {index % 2 === 0 && (
                <div
                  className={`mb-8 text-center transition-all duration-200 ${
                    dragOverId === event.id ? "bg-white/10 rounded-lg p-2 -m-2" : ""
                  }`}
                >
                  <span className="mb-2 block text-lg font-bold text-white">{event.year}</span>
                  <h3 className="mb-1 text-sm font-semibold text-white md:text-base">{event.title}</h3>
                  <p className="max-w-28 text-xs text-white/50 md:max-w-36 md:text-sm">{event.description}</p>
                </div>
              )}

              <div
                className={`relative z-10 h-3 w-px bg-white transition-all duration-500 ${
                  isVisible ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transitionDelay: draggedId ? "0ms" : `${500 + index * 200}ms`,
                }}
              />

              {/* Bottom content (alternating) */}
              {index % 2 !== 0 && (
                <div
                  className={`mt-8 text-center transition-all duration-200 ${
                    dragOverId === event.id ? "bg-white/10 rounded-lg p-2 -m-2" : ""
                  }`}
                >
                  <span className="mb-2 block text-lg font-bold text-white">{event.year}</span>
                  <h3 className="mb-1 text-sm font-semibold text-white md:text-base">{event.title}</h3>
                  <p className="max-w-28 text-xs text-white/50 md:max-w-36 md:text-sm">{event.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
