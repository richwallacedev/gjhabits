import { PET_NAMES, PET_ROLE } from "@/lib/pets";
import type { PetId, PetMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetMascotProps = {
  pet: PetId;
  mood?: PetMood;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  className?: string;
};

export function PetMascot({
  pet,
  mood = "happy",
  size = "md",
  animated = true,
  className
}: PetMascotProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <PetAvatar pet={pet} mood={mood} size={size} animated={animated} />
      <div>
        <p className="text-sm font-semibold text-primary">{PET_NAMES[pet]}</p>
        <p className="text-xs text-muted-foreground">{PET_ROLE[pet]}</p>
      </div>
    </div>
  );
}
