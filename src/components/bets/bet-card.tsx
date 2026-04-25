"use client";

import { useActionState, useMemo } from "react";
import { Clock3, Crown, Gavel } from "lucide-react";

import type { MutationState } from "@/app/(app)/actions";
import { resolveBetAction } from "@/app/(app)/actions";
import { getPetReactionForBetResult } from "@/lib/pets";
import type { BetRow } from "@/lib/types";
import { displayUserLabel, formatFullDateTime } from "@/lib/format";
import { PetCelebration } from "@/components/pets/pet-celebration";
import { PetReaction } from "@/components/pets/pet-reaction";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: MutationState = {
  status: "idle"
};

type BetCardProps = {
  bet: BetRow;
  userOptions: { value: string; label: string }[];
  currentUserId?: string;
};

function getTimeLeftLabel(endsAt: string | null) {
  if (!endsAt) return "Sin fecha limite";
  const diffMs = new Date(endsAt).getTime() - Date.now();
  if (diffMs <= 0) return "Tiempo vencido";
  const totalHours = Math.floor(diffMs / 3_600_000);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  if (days > 0) return `${days}d ${hours}h restantes`;
  return `${hours}h restantes`;
}

function getBetProgress(startsAt: string | null, endsAt: string | null) {
  if (!startsAt || !endsAt) return 0;
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const ratio = ((now - start) / (end - start)) * 100;
  return Math.max(0, Math.min(100, ratio));
}

function resultText(bet: BetRow, currentUserId?: string) {
  if (bet.status !== "closed") return "active" as const;
  if (!currentUserId || !bet.winner_user_id) return "active" as const;
  if (bet.winner_user_id === currentUserId) return "won" as const;
  return "lost" as const;
}

export function BetCard({ bet, userOptions, currentUserId }: BetCardProps) {
  const [state, formAction, pending] = useActionState(resolveBetAction, initialState);

  const resolverOptions = useMemo(() => {
    const options = new Map<string, string>();
    userOptions.forEach((entry) => options.set(entry.value, entry.label));
    options.set(bet.created_by, displayUserLabel(bet.created_by));
    if (bet.assigned_to) {
      options.set(bet.assigned_to, displayUserLabel(bet.assigned_to));
    }
    return [...options.entries()].map(([value, label]) => ({ value, label }));
  }, [bet.assigned_to, bet.created_by, userOptions]);

  const reaction = getPetReactionForBetResult(resultText(bet, currentUserId));

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{bet.title}</p>
          <p className="text-xs text-muted-foreground">
            {bet.type} · {bet.condition_type}
          </p>
        </div>
        <Badge variant={bet.status === "active" ? "warning" : "success"}>
          {bet.status === "active" ? "Activa" : "Cerrada"}
        </Badge>
      </div>

      {bet.description ? <p className="text-sm text-primary">{bet.description}</p> : null}

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="rounded-xl bg-slate-50 px-2 py-1.5">
          <p className="font-medium text-primary">Castigo</p>
          <p>{bet.penalty}</p>
        </div>
        <div className="rounded-xl bg-slate-50 px-2 py-1.5">
          <p className="font-medium text-primary">Recompensa</p>
          <p>{bet.reward || "Sin recompensa"}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock3 className="h-3.5 w-3.5" />
        <span>{getTimeLeftLabel(bet.ends_at)}</span>
      </div>
      {bet.status === "active" ? (
        <Progress value={getBetProgress(bet.starts_at, bet.ends_at)} indicatorClassName="bg-gamification" />
      ) : null}

      <PetReaction pet={reaction.pet} mood={reaction.mood} message={reaction.message} />

      {bet.status === "closed" ? (
        <>
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-success/10 p-2 text-xs">
            <p className="flex items-center gap-1 text-success">
              <Crown className="h-3.5 w-3.5" />
              Ganador:{" "}
              <span className="font-semibold text-primary">
                {bet.winner_user_id ? displayUserLabel(bet.winner_user_id) : "N/A"}
              </span>
            </p>
            <p className="text-danger">
              Perdedor:{" "}
              <span className="font-semibold text-primary">
                {bet.loser_user_id ? displayUserLabel(bet.loser_user_id) : "N/A"}
              </span>
            </p>
          </div>
          {resultText(bet, currentUserId) === "won" ? (
            <PetCelebration message="Ganaron la apuesta de la semana." />
          ) : null}
        </>
      ) : (
        <form action={formAction} className="space-y-2 rounded-xl border border-border/70 bg-slate-50 p-3">
          <input name="bet_id" defaultValue={bet.id} type="hidden" />
          <p className="flex items-center gap-1 text-xs font-semibold text-primary">
            <Gavel className="h-3.5 w-3.5" />
            Cerrar resultado
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`winner-${bet.id}`}>Ganador</Label>
              <Select
                id={`winner-${bet.id}`}
                name="winner_user_id"
                defaultValue={resolverOptions[0]?.value}
                options={resolverOptions}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`loser-${bet.id}`}>Perdedor</Label>
              <Select
                id={`loser-${bet.id}`}
                name="loser_user_id"
                defaultValue={resolverOptions[1]?.value ?? resolverOptions[0]?.value}
                options={resolverOptions}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label htmlFor={`winner-points-${bet.id}`}>Puntos ganador</Label>
              <Input id={`winner-points-${bet.id}`} name="winner_points" type="number" defaultValue={50} />
            </div>
            <div className="space-y-1">
              <Label htmlFor={`loser-points-${bet.id}`}>Puntos perdedor</Label>
              <Input id={`loser-points-${bet.id}`} name="loser_points" type="number" defaultValue={20} />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor={`notes-${bet.id}`}>Notas</Label>
            <Textarea id={`notes-${bet.id}`} name="notes" rows={2} placeholder="Se cumple la apuesta." />
          </div>
          {state.message ? (
            <p
              className={
                state.status === "success"
                  ? "rounded-lg bg-success/10 px-2 py-1 text-xs text-success"
                  : "rounded-lg bg-danger/10 px-2 py-1 text-xs text-danger"
              }
            >
              {state.message}
            </p>
          ) : null}
          <Button type="submit" size="sm" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Cerrar apuesta"}
          </Button>
        </form>
      )}

      <p className="text-[11px] text-muted-foreground">
        Creada: {formatFullDateTime(bet.created_at)}
      </p>
    </div>
  );
}
