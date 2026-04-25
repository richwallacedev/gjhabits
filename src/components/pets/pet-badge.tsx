import { BadgeCheck, Lock } from "lucide-react";

import type { PetBadgeStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetBadgeProps = {
  badge: PetBadgeStatus;
  className?: string;
};

export function PetBadge({ badge, className }: PetBadgeProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-white p-3",
        badge.unlocked ? "shadow-soft" : "opacity-70",
        className
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <PetAvatar pet={badge.pet} mood={badge.unlocked ? "proud" : "sleepy"} size="sm" />
        {badge.unlocked ? (
          <BadgeCheck className="h-4 w-4 text-success" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <p className="text-sm font-semibold text-primary">{badge.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{badge.description}</p>
      <p className="mt-1 text-xs font-medium text-primary">{badge.progressText}</p>
    </div>
  );
}
