import type { PetId, PetMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetMessageProps = {
  pet: PetId;
  mood?: PetMood;
  message: string;
  animated?: boolean;
  className?: string;
};

export function PetMessage({
  pet,
  mood = "happy",
  message,
  animated = true,
  className
}: PetMessageProps) {
  return (
    <div className={cn("flex items-start gap-2 rounded-2xl bg-white p-3 shadow-soft", className)}>
      <PetAvatar pet={pet} mood={mood} size="sm" animated={animated} />
      <p className="pt-1 text-sm text-primary">{message}</p>
    </div>
  );
}
