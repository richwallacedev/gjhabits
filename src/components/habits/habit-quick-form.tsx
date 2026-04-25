"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { MutationState } from "@/app/(app)/actions";
import { createHabitAction } from "@/app/(app)/actions";
import { PetHabitIcon } from "@/components/pets/pet-habit-icon";
import { PetReaction } from "@/components/pets/pet-reaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { HABIT_TYPES } from "@/lib/constants";
import { formatDateInputValue } from "@/lib/format";
import { getPetMessageByHabit } from "@/lib/pets";

const initialState: MutationState = {
  status: "idle"
};

export function HabitQuickForm() {
  const [state, formAction, pending] = useActionState(createHabitAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [doneAt, setDoneAt] = useState(formatDateInputValue(new Date()));
  const [habitType, setHabitType] = useState<(typeof HABIT_TYPES)[number]>(HABIT_TYPES[0]);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setDoneAt(formatDateInputValue(new Date()));
      setHabitType(HABIT_TYPES[0]);
    }
  }, [state.status]);

  const petHint = getPetMessageByHabit(habitType);

  return (
    <Card className="bg-fintech-gradient">
      <CardHeader>
        <CardTitle>Registro rapido de habito</CardTitle>
        <p className="text-sm text-muted-foreground">Marca lo que cumplieron hoy.</p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="habit_type">Tipo de habito</Label>
            <Select
              id="habit_type"
              name="habit_type"
              value={habitType}
              onChange={(event) =>
                setHabitType(event.target.value as (typeof HABIT_TYPES)[number])
              }
              options={HABIT_TYPES.map((value) => ({ label: value, value }))}
            />
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/80 px-2 py-2">
            <PetHabitIcon habitType={habitType} size="md" />
            <PetReaction pet={petHint.pet} mood={petHint.mood} message={petHint.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="done_at">Fecha / hora</Label>
              <Input
                id="done_at"
                name="done_at"
                type="datetime-local"
                value={doneAt}
                onChange={(event) => setDoneAt(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration_minutes">Duracion (min)</Label>
              <Input
                id="duration_minutes"
                name="duration_minutes"
                type="number"
                min="0"
                max="720"
                placeholder="30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Nota (opcional)</Label>
            <Textarea id="note" name="note" maxLength={160} rows={3} placeholder="Detalles rapidos..." />
          </div>
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
          <Button type="submit" size="lg" className="w-full" disabled={pending}>
            {pending ? "Guardando..." : "Registrar habito"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
