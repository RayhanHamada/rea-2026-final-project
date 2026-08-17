"use server";

import { headers } from "next/headers";

import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";
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
