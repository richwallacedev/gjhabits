"use client";

import Link from "next/link";
import { Plus, Trophy, WalletCards, Zap } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FloatingActions() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
      <div
        className={cn(
          "grid gap-2 overflow-hidden transition-all",
          open ? "max-h-56 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <Button
          asChild
          variant="secondary"
          className="h-10 justify-start gap-2 rounded-xl bg-white px-3 shadow-soft"
          onClick={() => setOpen(false)}
        >
          <Link href="/apuestas">
            <Trophy className="h-4 w-4" />
            Crear apuesta
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="h-10 justify-start gap-2 rounded-xl bg-white px-3 shadow-soft"
          onClick={() => setOpen(false)}
        >
          <Link href="/habitos">
            <Zap className="h-4 w-4" />
            Registrar habito
          </Link>
        </Button>
        <Button
          asChild
          variant="secondary"
          className="h-10 justify-start gap-2 rounded-xl bg-white px-3 shadow-soft"
          onClick={() => setOpen(false)}
        >
          <Link href="/gastos">
            <WalletCards className="h-4 w-4" />
            Registrar gasto
          </Link>
        </Button>
      </div>
      <motion.div animate={{ y: [0, -2, 0] }} transition={{ duration: 1.8, repeat: Infinity }}>
        <Button
          size="icon"
          className="h-14 w-14 rounded-full shadow-soft"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Abrir registro rapido"
        >
          <Plus className={cn("h-6 w-6 transition-transform", open && "rotate-45")} />
        </Button>
      </motion.div>
    </div>
  );
}
