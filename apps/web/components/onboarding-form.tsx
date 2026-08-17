"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ROLE } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface RoleOption {
  value: (typeof ROLE)[keyof typeof ROLE];
  title: string;
  description: string;
  emoji: string;
}

const OPTIONS: RoleOption[] = [
  {
    value: ROLE.RECRUITER,
    title: "Recruiter",
    description: "Looking for the right talent to build your team.",
    emoji: "🧑‍💼",
  },
  {
    value: ROLE.CANDIDATE,
    title: "Candidate",
    description: "On the hunt for your next great role.",
    emoji: "🧑‍🎓",
  },
];

export function OnboardingForm() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Please choose your role</CardTitle>
        <CardDescription>
          We&apos;ll tailor the experience just for you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                "group flex items-center gap-4 rounded-xl border p-4 text-left",
                "transition-all outline-none select-none",
                "hover:border-primary hover:bg-muted",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-3",
                "active:translate-y-px",
                "border-border"
              )}
            >
              <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full text-xl transition-transform group-hover:scale-110">
                {option.emoji}
              </span>
              <span>
                <span className="block text-sm font-medium">
                  {option.title}
                </span>
                <span className="text-muted-foreground block text-sm">
                  {option.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
