"use client";

import { ONBOARDING_OPEN_EVENT } from "@/lib/onboarding";

export function OnboardingTrigger({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => window.dispatchEvent(new Event(ONBOARDING_OPEN_EVENT))}
    >
      Welches Buch passt zu dir? →
    </button>
  );
}
