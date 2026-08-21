import { and, desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";

import { UserLayout } from "@/components/public/user-layout";
import { getStore } from "@/lib/cloudflare";
import { createDb } from "@/lib/db/client";
import { cv, user } from "@/lib/db/schema";
import { s3mini } from "@/lib/r2";

async function getUserData(userId: string) {
  const env = getStore();
  if (!env) {
    return null;
  }

  const db = createDb(env);

  const [userRecord] = await db
    .select()
    .from(user)
    .where(eq(user.id, userId))
    .limit(1);

  if (!userRecord) {
    return null;
  }

  const [cvRecord] = await db
    .select()
    .from(cv)
    .where(and(eq(cv.userId, userId), eq(cv.isCurrentlyUsed, true)))
    .orderBy(desc(cv.createdAt))
    .limit(1);

  const cvUrl = cvRecord
    ? await s3mini.getPresignedUrl("GET", cvRecord.key, 7 * 24 * 3600)
    : undefined;

  return { user: userRecord, cvUrl };
}

export default async function UserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUserData(id);

  if (!data) {
    notFound();
  }

  return <UserLayout cvUrl={data.cvUrl} />;
}
