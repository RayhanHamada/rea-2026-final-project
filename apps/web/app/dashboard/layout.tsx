import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { createAuth } from "@/lib/auth";
import { getStore } from "@/lib/cloudflare";
import { ROLE } from "@/lib/constants";

type Props = Readonly<{ children: React.ReactNode }>;

export default async function DashboardLayout({ children }: Props) {
  const env = getStore();
  if (!env) {
    throw new Error("No Env");
  }

  const header = await headers();
  const session = await createAuth(env).api.getSession({ headers: header });
  const roles = session?.user.role?.split(",") ?? [];
  if (roles.length === 1 && roles.at(0) === ROLE.ADMIN) {
    redirect("/onboarding");
  }

  return <DashboardShell>{children}</DashboardShell>;
}
