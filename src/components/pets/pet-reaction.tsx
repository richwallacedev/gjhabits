"use client";

import { motion } from "framer-motion";

import type { PetId, PetMood } from "@/lib/constants";
import { cn } from "@/lib/utils";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetReactionProps = {
  pet: PetId;
  mood?: PetMood;
  message: string;
  className?: string;
};

export function PetReaction({ pet, mood = "alert", message, className }: PetReactionProps) {
  return (
    <motion.div
      className={cn(
        "flex items-center gap-2 rounded-xl border border-border/70 bg-petwarm px-3 py-2",
        className
      )}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <PetAvatar pet={pet} mood={mood} size="sm" />
      <p className="text-xs font-medium text-primary">{message}</p>
    </motion.div>
  );
}
