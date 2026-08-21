export function PdfViewer({ src }: { src?: string }) {
  if (!src) {
    return (
      <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
        No CV available.
      </div>
    );
  }

  return (
    <iframe
      src={src}
      className="size-full"
      title="CV Preview"
    />
  );
}
