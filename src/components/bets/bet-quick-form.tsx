"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { MutationState } from "@/app/(app)/actions";
import { createBetAction } from "@/app/(app)/actions";
import { PetMessage } from "@/components/pets/pet-message";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  BET_CONDITION_TYPES,
  BET_PENALTIES,
  BET_REWARDS,
  BET_TYPES
} from "@/lib/constants";
import { formatDateInputValue } from "@/lib/format";

const initialState: MutationState = {
  status: "idle"
};

type BetQuickFormProps = {
  userOptions: { value: string; label: string }[];
};

export function BetQuickForm({ userOptions }: BetQuickFormProps) {
  const [state, formAction, pending] = useActionState(createBetAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [startsAt, setStartsAt] = useState(formatDateInputValue(new Date()));
  const [endsAt, setEndsAt] = useState("");

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setStartsAt(formatDateInputValue(new Date()));
      setEndsAt("");
    }
  }, [state.status]);

  return (
    <Card className="bg-fintech-gradient">
      <CardHeader>
        <CardTitle>Apuesta sana</CardTitle>
        <p className="text-sm text-muted-foreground">
          Compromiso ligero de pareja, no gambling.
        </p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="title">Titulo</Label>
            <Input id="title" name="title" placeholder="Si alguien pasa presupuesto paga cafe" required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Descripcion</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              maxLength={220}
              placeholder="Regla clara para cerrar sin discusiones."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="type">Tipo</Label>
              <Select
                id="type"
                name="type"
                defaultValue={BET_TYPES[0]}
                options={BET_TYPES.map((value) => ({ label: value, value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="condition_type">Condicion</Label>
              <Select
                id="condition_type"
                name="condition_type"
                defaultValue={BET_CONDITION_TYPES[0]}
                options={BET_CONDITION_TYPES.map((value) => ({ label: value, value }))}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="penalty">Castigo</Label>
              <Select
                id="penalty"
                name="penalty"
                defaultValue={BET_PENALTIES[0]}
                options={BET_PENALTIES.map((value) => ({ label: value, value }))}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reward">Recompensa</Label>
              <Select
                id="reward"
                name="reward"
                defaultValue={BET_REWARDS[0]}
                options={BET_REWARDS.map((value) => ({ label: value, value }))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="assigned_to">Asignada a</Label>
            <Select
              id="assigned_to"
              name="assigned_to"
              defaultValue=""
              options={[
                { label: "Ambos / equipo", value: "" },
                ...userOptions.map((entry) => ({ label: entry.label, value: entry.value }))
              ]}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="starts_at">Inicio</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                value={startsAt}
                onChange={(event) => setStartsAt(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ends_at">Fin</Label>
              <Input
                id="ends_at"
                name="ends_at"
                type="datetime-local"
                value={endsAt}
                onChange={(event) => setEndsAt(event.target.value)}
              />
            </div>
          </div>
          <PetMessage
            pet="tomasa"
            mood="proud"
            message="Tomasa revisa la regla antes de activarla."
          />
          {state.message ? (
            <p
              className={
                state.status === "success"
                  ? "rounded-xl bg-success/10 px-3 py-2 text-sm text-success"
                  : "rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger"
              }
            >
              {state.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Creando..." : "Crear apuesta"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
