"use server";

import { and, desc, eq, gt } from "drizzle-orm";
import { PDFDocument, PDFName } from "pdf-lib";
import QRCode from "qrcode";
import { headers } from "next/headers";

import { createAuth } from "@/lib/auth";
import { appenv } from "@/lib/appenv";
import { getStore } from "@/lib/cloudflare";
import { createDb } from "@/lib/db/client";
import { cv, cvDownloadUrl } from "@/lib/db/schema";
import { s3mini } from "@/lib/r2";

export { type CvRecord } from "@/lib/db/schema";

export async function listCvRecords() {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);
  return db
    .select()
    .from(cv)
    .where(eq(cv.userId, session.user.id))
    .orderBy(desc(cv.createdAt));
}

export interface PresignedUploadResult {
  url: string;
  key: string;
}

export async function createPresignedCvUploadUrl(): Promise<PresignedUploadResult> {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const key = `cvs/${session.user.id}/${crypto.randomUUID()}.pdf`;
  const url = await s3mini.getPresignedUrl(
    "PUT",
    key,
    300,
    {},
    { "Content-Type": "application/pdf" }
  );

  return { url, key };
}

export async function saveCvRecord({
  key,
  originalFilename,
}: {
  key: string;
  originalFilename: string;
}) {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);

  const [existing] = await db.select().from(cv).where(eq(cv.key, key));
  if (existing) {
    return existing;
  }

  const [record] = await db
    .insert(cv)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      originalFilename,
      key,
    })
    .returning();

  return record;
}

export async function getCvDownloadUrl(cvId: string) {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);
  const [record] = await db.select().from(cv).where(eq(cv.id, cvId)).limit(1);

  if (!record || record.userId !== session.user.id) {
    throw new Error("CV not found.");
  }

  const now = new Date();
  const [cached] = await db
    .select()
    .from(cvDownloadUrl)
    .where(and(eq(cvDownloadUrl.cvId, cvId), gt(cvDownloadUrl.expiresAt, now)))
    .limit(1);

  if (cached) {
    return cached.url;
  }

  const url = await s3mini.getPresignedUrl("GET", record.key, 7 * 24 * 3600);
  const expiresAt = new Date(Date.now() + 7 * 24 * 3600 * 1000);

  await db.insert(cvDownloadUrl).values({
    id: crypto.randomUUID(),
    cvId,
    url,
    expiresAt,
  });

  return url;
}

export async function setCurrentCv(cvId: string) {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);
  const [record] = await db.select().from(cv).where(eq(cv.id, cvId)).limit(1);

  if (!record || record.userId !== session.user.id) {
    throw new Error("CV not found.");
  }

  await db
    .update(cv)
    .set({ isCurrentlyUsed: false })
    .where(eq(cv.userId, session.user.id));
  await db.update(cv).set({ isCurrentlyUsed: true }).where(eq(cv.id, cvId));
}

export interface QrCodeConfig {
  data?: string;
  width?: number;
  height?: number;
}

export async function copyCvForMarkedKey(
  cvId: string,
  qrCode?: QrCodeConfig
) {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);
  const [record] = await db.select().from(cv).where(eq(cv.id, cvId)).limit(1);

  if (!record || record.userId !== session.user.id) {
    throw new Error("CV not found.");
  }

  if (record.markedCvKey) {
    return record;
  }

  const markedCvKey = `cvs/${session.user.id}/${crypto.randomUUID()}.pdf`;

  const pdfBytes = await s3mini.getObjectArrayBuffer(record.key);
  if (!pdfBytes) {
    throw new Error("Failed to download CV.");
  }

  const pdfDoc = await PDFDocument.load(pdfBytes);
  const pages = pdfDoc.getPages();

  const qrData = qrCode?.data ?? `${appenv.BETTER_AUTH_URL}/${session.user.id}`;
  const qrWidth = qrCode?.width ?? 40;
  const qrHeight = qrCode?.height ?? 40;

  const qrPngBytes = await QRCode.toBuffer(qrData, {
    width: 64,
    margin: 1,
    type: "png",
  });
  const qrImage = await pdfDoc.embedPng(qrPngBytes);

  for (const page of pages) {
    const { width, height } = page.getSize();
    const x = width - qrWidth - 12;
    const y = height - qrHeight - 8;

    page.drawImage(qrImage, {
      x,
      y,
      width: qrWidth,
      height: qrHeight,
    });

    page.node.set(PDFName.of("Annots"), pdfDoc.context.obj([
      ...(page.node.Annots() ?? pdfDoc.context.obj([])).asArray() ?? [],
      pdfDoc.context.register(
        pdfDoc.context.obj({
          Type: "Annot",
          Subtype: "Link",
          Rect: [x, y, x + qrWidth, y + qrHeight],
          Border: [0, 0, 0],
          A: {
            Type: "Action",
            S: "URI",
            URI: qrData,
          },
        })
      ),
    ]));
  }

  const markedBytes = await pdfDoc.save();

  await s3mini.putObject(markedCvKey, Buffer.from(markedBytes), "application/pdf");

  const [updated] = await db
    .update(cv)
    .set({ markedCvKey, updatedAt: new Date() })
    .where(eq(cv.id, cvId))
    .returning();

  return updated;
}

export async function deleteCvRecord(cvId: string) {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be signed in to continue.");
  }

  const db = createDb(env);
  const [record] = await db.select().from(cv).where(eq(cv.id, cvId)).limit(1);

  if (!record || record.userId !== session.user.id) {
    throw new Error("CV not found.");
  }

  await s3mini.deleteObject(record.key);
  if (record.markedCvKey) {
    await s3mini.deleteObject(record.markedCvKey);
  }
  await db.delete(cv).where(eq(cv.id, cvId));
}
