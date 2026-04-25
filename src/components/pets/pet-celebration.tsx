"use client";

import { motion } from "framer-motion";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetCelebrationProps = {
  message: string;
};

const confetti = [
  { left: "12%", color: "#22C55E", delay: 0 },
  { left: "28%", color: "#8B5CF6", delay: 0.1 },
  { left: "44%", color: "#38BDF8", delay: 0.2 },
  { left: "60%", color: "#F59E0B", delay: 0.05 },
  { left: "76%", color: "#EF4444", delay: 0.15 }
];

export function PetCelebration({ message }: PetCelebrationProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-success/30 bg-success/10 p-4">
      <div className="flex items-center gap-3">
        <PetAvatar pet="dante" mood="happy" size="md" />
        <div>
          <p className="text-sm font-semibold text-success">Dante celebra</p>
          <p className="text-sm text-primary">{message}</p>
        </div>
      </div>
      {confetti.map((item, index) => (
        <motion.span
          key={index}
          className="absolute top-2 h-2 w-2 rounded-full"
          style={{ left: item.left, backgroundColor: item.color }}
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: [0, 24, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: item.delay }}
        />
      ))}
    </div>
  );
}
