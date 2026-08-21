"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

import { AiChatPanel } from "@/components/public/ai-chat-panel";
import { PdfViewer } from "@/components/public/pdf-viewer";

export function UserLayout({ cvUrl }: { cvUrl?: string }) {
  return (
    <main className="flex h-screen flex-col">
      <ResizablePanelGroup
        orientation="horizontal"
        className="flex-1"
      >
        <ResizablePanel defaultSize={40} minSize={30}>
          <AiChatPanel />
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60} minSize={30}>
          <PdfViewer src={cvUrl} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </main>
  );
}
