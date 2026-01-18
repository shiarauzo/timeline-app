"use client";

import { Timeline } from "@/components/timeline";
import { ChatPanel } from "@/components/chat-panel";
import { ZoomControls } from "@/components/zoom-controls";
import { TimelineHeader } from "@/components/timeline-header";
import { EmptyState } from "@/components/empty-state";
import { TimelineProvider, useTimeline } from "@/lib/timeline-context";

function PageContent() {
  const { events } = useTimeline();
  const hasEvents = events.length > 0;

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {hasEvents && <TimelineHeader />}

      {hasEvents ? (
        <Timeline />
      ) : (
        <div className="relative z-10 w-full max-w-6xl">
          <EmptyState />
        </div>
      )}

      {hasEvents && (
        <>
          <ChatPanel />
          <ZoomControls />
        </>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <TimelineProvider>
      <PageContent />
    </TimelineProvider>
  );
}
