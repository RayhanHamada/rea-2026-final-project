"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Check } from "lucide-react";

import { setOnboardingRole } from "@/app/onboarding/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Saving…" : "Continue"}
    </Button>
  );
}

export function OnboardingForm() {
  const [state, formAction] = useActionState(setOnboardingRole, null);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle>Please choose your role</CardTitle>
        <CardDescription>
          We&apos;ll tailor the experience just for you.
        </CardDescription>
      </CardHeader>
      <form action={formAction}>
        <CardContent>
          <fieldset className="flex flex-col gap-3">
            <legend className="sr-only">Select your role</legend>
            {OPTIONS.map((option) => (
              <label
                key={option.value}
                className="group cursor-pointer select-none"
              >
                <input
                  type="radio"
                  name="role"
                  value={option.value}
                  className="sr-only"
                />
                <span
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4 text-left",
                    "transition-all outline-none",
                    "hover:border-primary hover:bg-muted",
                    "group-has-[:checked]:border-primary group-has-[:checked]:bg-primary/5",
                    "group-focus-within:border-ring group-focus-within:ring-ring/50 group-focus-within:ring-3",
                    "active:translate-y-px",
                    "border-border"
                  )}
                >
                  <span className="bg-muted flex size-10 shrink-0 items-center justify-center rounded-full text-xl transition-transform group-has-[:checked]:scale-110">
                    {option.emoji}
                  </span>
                  <span className="flex-1">
                    <span className="block text-sm font-medium">
                      {option.title}
                    </span>
                    <span className="text-muted-foreground block text-sm">
                      {option.description}
                    </span>
                  </span>
                  <Check className="size-4 text-primary opacity-0 transition-opacity group-has-[:checked]:opacity-100" />
                </span>
              </label>
            ))}
          </fieldset>
          {state?.error ? (
            <p className="text-destructive mt-4 text-sm">{state.error}</p>
          ) : null}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
