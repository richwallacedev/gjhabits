import { endOfDay, format, startOfDay, subDays } from "date-fns";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, getKnownUserMap } from "@/lib/constants";
import { displayUserLabel, formatCurrencyMXN, formatFullDateTime } from "@/lib/format";
import { getHistoryExpenses } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

type HistorialPageProps = {
  searchParams: Promise<{
    from?: string;
    to?: string;
    user?: string;
    category?: string;
    payment?: string;
  }>;
};

export default async function HistorialPage({ searchParams }: HistorialPageProps) {
  const params = await searchParams;
  const from = params.from ?? format(startOfDay(subDays(new Date(), 6)), "yyyy-MM-dd");
  const to = params.to ?? format(endOfDay(new Date()), "yyyy-MM-dd");
  const userId = params.user ?? "all";
  const category = params.category ?? "all";
  const payment = params.payment ?? "all";

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  const expenses = await getHistoryExpenses({
    from,
    to,
    userId,
    category,
    paymentMethod: payment
  });

  const knownUsers = [...getKnownUserMap().entries()].map(([value, label]) => ({
    value,
    label
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <form method="GET" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="from">
                Desde
              </label>
              <Input id="from" name="from" type="date" defaultValue={from} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="to">
                Hasta
              </label>
              <Input id="to" name="to" type="date" defaultValue={to} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="user">
                Usuario
              </label>
              <Select
                id="user"
                name="user"
                defaultValue={userId}
                options={[
                  { label: "Todos", value: "all" },
                  ...knownUsers.map((entry) => ({ label: entry.label, value: entry.value }))
                ]}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="category">
                Categoría
              </label>
              <Select
                id="category"
                name="category"
                defaultValue={category}
                options={[
                  { label: "Todas", value: "all" },
                  ...EXPENSE_CATEGORIES.map((value) => ({ label: value, value }))
                ]}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="payment">
                Método de pago
              </label>
              <Select
                id="payment"
                name="payment"
                defaultValue={payment}
                options={[
                  { label: "Todos", value: "all" },
                  ...PAYMENT_METHODS.map((value) => ({ label: value, value }))
                ]}
              />
            </div>
            <button
              type="submit"
              className="sm:col-span-2 mt-1 h-11 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Aplicar filtros
            </button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Resultados ({expenses.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {expenses.length ? (
            <ul className="space-y-2">
              {expenses.map((expense, index) => (
                <li
                  key={expense.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-primary">{expense.category}</p>
                    <p className="text-xs text-muted-foreground">
                      {displayUserLabel(expense.user_id, {
                        currentUserId: user?.id,
                        fallbackIndex: index
                      })}{" "}
                      · {expense.payment_method}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFullDateTime(expense.spent_at)}
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
            <p className="text-sm text-muted-foreground">No hay gastos para esos filtros.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
