import type { HabitType } from "@/lib/types";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetHabitIconProps = {
  habitType: HabitType | string;
  size?: "sm" | "md";
};

export function PetHabitIcon({ habitType, size = "sm" }: PetHabitIconProps) {
  if (habitType === "Paseo de Dante") {
    return <PetAvatar pet="dante" mood="happy" size={size} />;
  }
  if (habitType === "Día dentro del presupuesto") {
    return <PetAvatar pet="tomasa" mood="proud" size={size} />;
  }
  if (habitType === "Ejercicio") {
    return <PetAvatar pet="dante" mood="proud" size={size} />;
  }
  return <PetAvatar pet="lucien" mood="sleepy" size={size} />;
}
