"use client";

import { useRef, useState } from "react";
import type { DragEvent } from "react";
import { FileText, Upload, UploadCloud, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface SelectedPdf {
  name: string;
  size: number;
}

const MAX_SIZE = 10 * 1024 * 1024;

function formatBytes(bytes: number) {
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${i === 0 ? value : parseFloat(value.toFixed(1))} ${sizes[i]}`;
}

export function PdfDropzone() {
  const [file, setFile] = useState<SelectedPdf | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFile(candidate: File | undefined) {
    setError(null);
    if (!candidate) return;
    if (candidate.type !== "application/pdf") {
      setError("Only PDF files are allowed.");
      return;
    }
    if (candidate.size > MAX_SIZE) {
      setError("File is too large. The maximum is 10 MB.");
      return;
    }
    setFile({ name: candidate.name, size: candidate.size });
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsDragActive(false);
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) handleFile(dropped);
  }

  function clearFile() {
    setFile(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Upload a CV</CardTitle>
        <CardDescription>Drop a single PDF to get started.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {file ? (
          <div className="flex items-center gap-3 rounded-xl border p-3">
            <div className="bg-destructive/10 text-destructive flex size-10 shrink-0 items-center justify-center rounded-lg">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {formatBytes(file.size)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Remove file"
              onClick={clearFile}
            >
              <X />
            </Button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload a PDF CV"
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragActive(true);
            }}
            onDragOver={(event) => event.preventDefault()}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragActive(false);
            }}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                inputRef.current?.click();
              }
            }}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-10 text-center outline-none",
              "transition-colors",
              "hover:border-primary hover:bg-muted/50",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
              isDragActive && "border-primary bg-primary/5"
            )}
          >
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => handleFile(event.target.files?.[0])}
            />
            <div className="bg-muted flex size-12 items-center justify-center rounded-full">
              <UploadCloud className="size-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragActive
                  ? "Drop your PDF here"
                  : "Drag & drop your PDF here"}
              </p>
              <p className="text-muted-foreground text-xs">
                or <span className="underline">browse</span> your files
              </p>
            </div>
            <p className="text-muted-foreground text-xs">
              PDF only · up to 10 MB
            </p>
          </div>
        )}
        {error ? <p className="text-destructive text-sm">{error}</p> : null}
        {file ? (
          <Button
            type="button"
            className="w-full"
            onClick={() => {
              // TODO: wire up actual upload
            }}
          >
            <Upload />
            Upload CV
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}