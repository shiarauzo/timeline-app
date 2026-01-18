"use client";

import { Button } from "@/components/ui/button";
import { Minus, Plus, Maximize2 } from "lucide-react";
import { useTimeline } from "@/lib/timeline-context";

export function ZoomControls() {
  const { zoom, zoomIn, zoomOut, resetZoom } = useTimeline();

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-1 rounded-lg border border-white/20 bg-black/80 backdrop-blur-sm p-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        onClick={zoomOut}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <button
        onClick={resetZoom}
        className="px-2 text-sm text-white/70 hover:text-white min-w-[50px]"
      >
        {Math.round(zoom * 100)}%
      </button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        onClick={zoomIn}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
        onClick={resetZoom}
      >
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
