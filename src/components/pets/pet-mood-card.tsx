import type { PetNarrative } from "@/lib/types";

import { PetAvatar } from "@/components/pets/pet-avatar";
import { PetMessage } from "@/components/pets/pet-message";

type PetMoodCardProps = {
  narrative: PetNarrative;
};

export function PetMoodCard({ narrative }: PetMoodCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-fintech-gradient p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">Mascotas GJ</p>
          <p className="text-base font-semibold text-primary">{narrative.title}</p>
        </div>
        <PetAvatar pet={narrative.pet} mood={narrative.mood} size="lg" />
      </div>
      <PetMessage pet={narrative.pet} mood={narrative.mood} message={narrative.message} />
      {narrative.secondaryPet && narrative.secondaryMessage ? (
        <PetMessage
          className="mt-2"
          pet={narrative.secondaryPet}
          mood={narrative.secondaryMood}
          message={narrative.secondaryMessage}
        />
      ) : null}
    </div>
  );
}
