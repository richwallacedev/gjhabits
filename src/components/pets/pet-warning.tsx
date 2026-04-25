import { AlertTriangle } from "lucide-react";

import { PetAvatar } from "@/components/pets/pet-avatar";

type PetWarningProps = {
  message: string;
};

export function PetWarning({ message }: PetWarningProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-danger/30 bg-danger/10 p-3">
      <PetAvatar pet="tomasa" mood="angry" size="md" />
      <div className="flex-1">
        <p className="flex items-center gap-1 text-sm font-semibold text-danger">
          <AlertTriangle className="h-4 w-4" />
          Tomasa en modo auditora
        </p>
        <p className="text-sm text-primary">{message}</p>
      </div>
    </div>
  );
}
