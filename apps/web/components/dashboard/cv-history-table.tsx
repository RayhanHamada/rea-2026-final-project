// oxlint-disable react/no-unstable-nested-components

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender } from "@tanstack/react-table";
import {
  getCoreRowModel,
  getPaginationRowModel,
  useLegacyTable,
} from "@tanstack/react-table/legacy";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import {
  listCvRecords,
  getCvDownloadUrl,
  deleteCvRecord,
} from "@/app/actions/upload-cv";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { CvRecord } from "@/lib/db/schema";

const PAGE_SIZE = 5;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function DeleteButton({ cvId, filename }: { cvId: string; filename: string }) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const del = useMutation({
    mutationFn: () => deleteCvRecord(cvId),
    onSuccess: () => {
      toast.success("Deleted", { description: filename });
      queryClient.invalidateQueries({ queryKey: ["cvs"] });
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to delete.");
    },
    onSettled: () => setOpen(false),
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground hover:text-destructive"
          aria-label={`Delete ${filename}`}
        >
          <Trash2 />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete CV?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete{" "}
            <span className="text-foreground font-medium">{filename}</span>.
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={del.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={del.isPending}
            onClick={(e) => {
              e.preventDefault();
              del.mutate();
            }}
          >
            {del.isPending ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function CvHistoryTable() {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: PAGE_SIZE,
  });

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["cvs"],
    queryFn: listCvRecords,
  });

  const columns = useMemo<LegacyColumnDef<CvRecord>[]>(
    () => [
      {
        accessorKey: "originalFilename",
        header: "Filename",
      },
      {
        accessorKey: "createdAt",
        header: "Uploaded at",
        cell: ({ getValue }) => {
          const value = getValue<Date>();
          return formatDate(value);
        },
      },
      {
        id: "download",
        header: "",
        cell: ({ row }) => (
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={async (e) => {
              e.stopPropagation();
              const url = await getCvDownloadUrl(row.original.id);
              window.open(url, "_blank");
            }}
          >
            <Download />
            Download
          </Button>
        ),
      },
      {
        id: "delete",
        header: "",
        cell: ({ row }) => (
          <DeleteButton
            cvId={row.original.id}
            filename={row.original.originalFilename}
          />
        ),
      },
    ],
    []
  );

  const table = useLegacyTable({
    data: records,
    columns,
    pageCount: Math.ceil(records.length / PAGE_SIZE),
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="bg-card overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Filename</TableHead>
                <TableHead>Uploaded at</TableHead>
                <TableHead />
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="bg-card overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-muted-foreground py-10 text-center"
                >
                  No CVs uploaded yet.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {records.length > 0 && (
        <div className="text-muted-foreground flex items-center justify-between text-sm">
          <span>
            Showing {pagination.pageIndex * PAGE_SIZE + 1}
            &ndash;
            {Math.min(
              (pagination.pageIndex + 1) * PAGE_SIZE,
              records.length
            )}{" "}
            of {records.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
