// oxlint-disable jsx-a11y/prefer-tag-over-role

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FileText, Loader2, Upload, UploadCloud, X } from "lucide-react";
import { useRef, useState } from "react";
import type { DragEvent, KeyboardEvent } from "react";
import { toast } from "sonner";

import {
  copyCvForMarkedKey,
  createPresignedCvUploadUrl,
  saveCvRecord,
} from "@/app/actions/upload-cv";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_FILE_TYPE = "application/pdf";

function formatBytes(bytes: number) {
  if (bytes === 0) {
    return "0 B";
  }

  const units = ["B", "KB", "MB", "GB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** index;

  return `${index === 0 ? value : value.toFixed(1)} ${units[index]}`;
}

function validateFile(file: File) {
  if (file.type !== ACCEPTED_FILE_TYPE) {
    return "Only PDF files are allowed.";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. The maximum is 10 MB.";
  }

  return null;
}

export function PdfDropzone() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  const queryClient = useQueryClient();

  const upload = useMutation({
    mutationFn: async (f: File) => {
      const { url, key } = await createPresignedCvUploadUrl();

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          "Content-Type": f.type,
        },
        body: f,
      });

      if (!response.ok) {
        throw new Error("Upload failed. Please try again.");
      }

      return saveCvRecord({ key, originalFilename: f.name }).then((record) =>
        copyCvForMarkedKey(record.id).then(() => record)
      );
    },
    onSuccess: (_, variables) => {
      toast.success("CV uploaded", {
        description: variables.name,
      });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    onError: (error1) => {
      toast.error(error1 instanceof Error ? error1.message : "Upload failed.");
    },
  });

  const selectFile = (candidate?: File) => {
    if (!candidate) {
      return;
    }

    const validationError = validateFile(candidate);

    if (validationError) {
      toast.error(validationError);
      return;
    }

    upload.reset();
    setFile(candidate);
  };

  const clearFile = () => {
    upload.reset();
    setFile(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    selectFile(event.dataTransfer.files[0]);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    inputRef.current?.click();
  };

  const renderUploadArea = () => (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload a PDF CV"
      onClick={() => inputRef.current?.click()}
      onKeyDown={handleKeyDown}
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
        accept={`${ACCEPTED_FILE_TYPE},.pdf`}
        className="sr-only"
        onChange={(event) => {
          selectFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      <div className="bg-muted flex size-12 items-center justify-center rounded-full">
        <UploadCloud className="text-muted-foreground size-6" />
      </div>

      <div>
        <p className="text-sm font-medium">
          {isDragActive ? "Drop your PDF here" : "Drag & drop your PDF here"}
        </p>

        <p className="text-muted-foreground text-xs">
          or <span className="underline">browse</span> your files
        </p>
      </div>

      <p className="text-muted-foreground text-xs">PDF only · up to 10 MB</p>
    </div>
  );

  const renderFile = () => {
    if (!file) {
      return null;
    }

    return (
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
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Remove file"
          disabled={upload.isPending}
          onClick={clearFile}
        >
          <X />
        </Button>
      </div>
    );
  };

  const renderContent = () => {
    if (file) {
      return renderFile();
    }

    return renderUploadArea();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Upload a CV</CardTitle>
        <CardDescription>Drop a single PDF to get started.</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        {renderContent()}

        {file && !upload.isSuccess && (
          <Button
            type="button"
            className="w-full"
            disabled={upload.isPending}
            onClick={() => upload.mutate(file)}
          >
            {upload.isPending && <Loader2 className="animate-spin" />}
            {!upload.isPending && <Upload />}
            {upload.isPending ? "Uploading…" : "Upload CV"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
