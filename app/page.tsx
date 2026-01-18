import { Timeline } from "@/components/timeline";
import { ChatPanel } from "@/components/chat-panel";
import { ZoomControls } from "@/components/zoom-controls";
import { TimelineHeader } from "@/components/timeline-header";
import { TimelineProvider } from "@/lib/timeline-context";

export default function Page() {
  return (
    <TimelineProvider>
      <main className="relative flex min-h-screen flex-col items-center justify-center bg-black px-4">
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
            backgroundSize: "24px 24px",
          }}
        />

        <TimelineHeader />

        <div className="relative z-10 w-full max-w-6xl">
          <Timeline />
        </div>

        <ChatPanel />
        <ZoomControls />
      </main>
    </TimelineProvider>
  );
}
