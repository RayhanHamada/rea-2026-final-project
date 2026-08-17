// oxlint-disable react/function-component-definition

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";

export const dynamic = "force-dynamic";

export default async function Home() {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  redirect("/login");
}
