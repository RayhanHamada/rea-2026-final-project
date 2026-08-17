"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";
import type { Role } from "@/lib/constants";
import { ROLE } from "@/lib/constants";

export interface OnboardingState {
  error?: string;
}

export async function setOnboardingRole(
  _prevState: OnboardingState | null,
  formData: FormData
): Promise<OnboardingState | null> {
  const env = getStore();
  if (!env) {
    throw new Error("Cloudflare env not available outside a request");
  }

  const role = formData.get("role");
  if (role !== ROLE.RECRUITER && role !== ROLE.CANDIDATE) {
    return { error: "Please choose a valid role." };
  }

  const auth = createAuth(env);
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { error: "You must be signed in to continue." };
  }

  const roles = (session.user.role?.split(",") ?? []) as Role[];

  await auth.api.setRole({
    body: { userId: session.user.id, role: [...roles, role] },
    headers: await headers(),
  });

  redirect("/dashboard");
}
