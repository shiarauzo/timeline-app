"use client";

import { useState } from "react";
import { Pencil, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTimeline } from "@/lib/timeline-context";

const MAX_TITLE_LENGTH = 50;

export function TimelineHeader() {
  const { title, setTitle } = useTimeline();
  const [isOpen, setIsOpen] = useState(false);
  const [editValue, setEditValue] = useState(title);

  const handleOpen = () => {
    setEditValue(title);
    setIsOpen(true);
  };

  const handleSave = () => {
    if (editValue.trim()) {
      setTitle(editValue.trim());
    }
    setIsOpen(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-lg border border-white/20 bg-black/80 backdrop-blur-sm px-4 py-2">
          <span className="text-white font-medium">{title}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
            onClick={handleOpen}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/50 hover:text-white hover:bg-white/10"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 border-white/20 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Edit board name
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-white/60">
            This name will be visible to all participants.
          </p>
          <div className="space-y-2">
            <Input
              value={editValue}
              onChange={(e) =>
                setEditValue(e.target.value.slice(0, MAX_TITLE_LENGTH))
              }
              className="bg-zinc-800 border-white/20 text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
              autoFocus
            />
            <p className="text-xs text-white/40">
              {editValue.length}/{MAX_TITLE_LENGTH} characters
            </p>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={handleCancel} className="text-white/70 hover:text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-orange-500 hover:bg-orange-600 text-white">
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
