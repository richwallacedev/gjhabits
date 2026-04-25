import { AlertTriangle } from "lucide-react";

import { ExpenseQuickForm } from "@/components/expenses/expense-quick-form";
import { PetMessage } from "@/components/pets/pet-message";
import { PetWarning } from "@/components/pets/pet-warning";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DAILY_LIMIT_MXN } from "@/lib/constants";
import { formatCurrencyMXN, formatFullDateTime } from "@/lib/format";
import { getPetTone } from "@/lib/pets";
import { getBetsSummary, getDailySummary } from "@/lib/queries";

function statusVariant(status: "green" | "yellow" | "red") {
  if (status === "green") return "success";
  if (status === "yellow") return "warning";
  return "danger";
}

export default async function GastosPage() {
  const [daily, bets] = await Promise.all([getDailySummary(), getBetsSummary()]);
  const petTone = getPetTone({
    status: daily.status,
    impulsiveCountToday: daily.impulsiveCountToday,
    hasActiveBet: bets.active.length > 0
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-lg">
            <span>Control de gastos</span>
            <Badge variant={statusVariant(daily.status)}>{daily.message}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <p className="text-xs text-muted-foreground">Gastado hoy</p>
              <p className="text-lg font-semibold text-primary">{formatCurrencyMXN(daily.totalToday)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <p className="text-xs text-muted-foreground">Meta diaria</p>
              <p className="text-lg font-semibold text-primary">{formatCurrencyMXN(DAILY_LIMIT_MXN)}</p>
            </div>
          </div>
          <PetMessage pet={petTone.pet} mood={petTone.mood} message={petTone.message} />
          {daily.impulsiveCountToday > 0 ? (
            <PetMessage
              pet="lucien"
              mood="tempting"
              message="Lucien esta tentando otra vez. Respira antes de comprar."
            />
          ) : null}
          {daily.status === "red" ? (
            <PetWarning message="Tomasa dice: esto no esta aprobado." />
          ) : null}
          {daily.status === "red" ? (
            <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              <AlertTriangle className="h-4 w-4" />
              Ya superaron el presupuesto de hoy.
            </div>
          ) : null}
        </CardContent>
      </Card>

      <ExpenseQuickForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ultimos movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {daily.latestExpenses.length ? (
            <ul className="space-y-2">
              {daily.latestExpenses.map((expense) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between rounded-xl border border-border/70 bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">{expense.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.payment_method} · {formatFullDateTime(expense.spent_at)}
                    </p>
                    {expense.description ? (
                      <p className="text-xs text-muted-foreground">{expense.description}</p>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrencyMXN(Number(expense.amount))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin gastos por ahora.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
