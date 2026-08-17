"use server";

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";
import { createDb } from "@/lib/db/client";
import { cv } from "@/lib/db/schema";
import { s3mini } from "@/lib/r2";

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

  const downloadUrl = await s3mini.getPresignedUrl("GET", key, 7 * 24 * 3600);

  const [record] = await db
    .insert(cv)
    .values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      originalFilename,
      key,
      downloadUrl,
    })
    .returning();

  return record;
}
