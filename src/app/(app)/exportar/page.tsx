import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, getKnownUserMap } from "@/lib/constants";

export default function ExportarPage() {
  const knownUsers = [...getKnownUserMap().entries()].map(([value, label]) => ({
    value,
    label
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Exportar a Excel</CardTitle>
        </CardHeader>
        <CardContent>
          <form action="/api/export" method="GET" className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="dataset" className="text-xs font-medium text-muted-foreground">
                Dataset
              </label>
              <Select
                id="dataset"
                name="dataset"
                defaultValue="expenses"
                options={[
                  { label: "Gastos", value: "expenses" },
                  { label: "Habitos", value: "habits" },
                  { label: "Apuestas", value: "bets" },
                  { label: "Puntos", value: "points" }
                ]}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="from" className="text-xs font-medium text-muted-foreground">
                  Desde
                </label>
                <Input id="from" name="from" type="date" />
              </div>
              <div className="space-y-1">
                <label htmlFor="to" className="text-xs font-medium text-muted-foreground">
                  Hasta
                </label>
                <Input id="to" name="to" type="date" />
              </div>
            </div>
            <div className="space-y-1">
              <label htmlFor="user" className="text-xs font-medium text-muted-foreground">
                Usuario
              </label>
              <Select
                id="user"
                name="user"
                defaultValue="all"
                options={[
                  { label: "Todos", value: "all" },
                  ...knownUsers.map((entry) => ({ label: entry.label, value: entry.value }))
                ]}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="category" className="text-xs font-medium text-muted-foreground">
                Categoria (solo gastos)
              </label>
              <Select
                id="category"
                name="category"
                defaultValue="all"
                options={[
                  { label: "Todas", value: "all" },
                  ...EXPENSE_CATEGORIES.map((value) => ({ label: value, value }))
                ]}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="payment" className="text-xs font-medium text-muted-foreground">
                Metodo de pago (solo gastos)
              </label>
              <Select
                id="payment"
                name="payment"
                defaultValue="all"
                options={[
                  { label: "Todos", value: "all" },
                  ...PAYMENT_METHODS.map((value) => ({ label: value, value }))
                ]}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="status" className="text-xs font-medium text-muted-foreground">
                Estado (solo apuestas)
              </label>
              <Select
                id="status"
                name="status"
                defaultValue="all"
                options={[
                  { label: "Todos", value: "all" },
                  { label: "Activas", value: "active" },
                  { label: "Cerradas", value: "closed" },
                  { label: "Canceladas", value: "cancelled" }
                ]}
              />
            </div>
            <button
              type="submit"
              className="mt-1 h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground"
            >
              Exportar a Excel
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
