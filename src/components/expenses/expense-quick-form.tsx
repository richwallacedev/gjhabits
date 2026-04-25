"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import type { MutationState } from "@/app/(app)/actions";
import { createExpenseAction } from "@/app/(app)/actions";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/constants";
import { formatDateInputValue } from "@/lib/format";
import { getPetMessageByExpenseCategory } from "@/lib/pets";
import { PetReaction } from "@/components/pets/pet-reaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const initialState: MutationState = {
  status: "idle"
};

export function ExpenseQuickForm() {
  const [state, formAction, pending] = useActionState(createExpenseAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const [spentAt, setSpentAt] = useState(formatDateInputValue(new Date()));
  const [category, setCategory] = useState<(typeof EXPENSE_CATEGORIES)[number]>(
    EXPENSE_CATEGORIES[0]
  );

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
      setSpentAt(formatDateInputValue(new Date()));
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  }, [state.status]);

  const petHint = getPetMessageByExpenseCategory(category);

  return (
    <Card className="bg-fintech-gradient">
      <CardHeader>
        <CardTitle>Registro rapido de gasto</CardTitle>
        <p className="text-sm text-muted-foreground">Captura en menos de 5 segundos.</p>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={formAction} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
              <Input
                id="amount"
                name="amount"
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="spent_at">Fecha / hora</Label>
              <Input
                id="spent_at"
                name="spent_at"
                type="datetime-local"
                value={spentAt}
                onChange={(event) => setSpentAt(event.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select
              id="category"
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as (typeof EXPENSE_CATEGORIES)[number])
              }
              options={EXPENSE_CATEGORIES.map((value) => ({ label: value, value }))}
            />
          </div>
          <PetReaction pet={petHint.pet} mood={petHint.mood} message={petHint.message} />
          <div className="space-y-2">
            <Label htmlFor="payment_method">Metodo de pago</Label>
            <Select
              id="payment_method"
              name="payment_method"
              defaultValue={PAYMENT_METHODS[0]}
              options={PAYMENT_METHODS.map((value) => ({ label: value, value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descripcion (opcional)</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Ejemplo: desayuno o traslado"
              maxLength={160}
              rows={3}
            />
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
            {pending ? "Guardando..." : "Registrar gasto"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
