import type { Metadata } from "next";

import { OnboardingForm } from "@/components/onboarding-form";

export const metadata: Metadata = {
  title: "Get started",
};

export default function OnboardingPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center p-4">
      <OnboardingForm />
    </main>
  );
}
