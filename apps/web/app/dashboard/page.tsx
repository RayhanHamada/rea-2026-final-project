import { CvHistoryTable } from "@/components/dashboard/cv-history-table";
import { PdfDropzone } from "@/components/dashboard/pdf-dropzone";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      <PdfDropzone />
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold">Uploaded CVs</h2>
          <p className="text-muted-foreground text-sm">
            History of all your uploaded CV files.
          </p>
        </div>
        <CvHistoryTable />
      </section>
    </div>
  );
}
