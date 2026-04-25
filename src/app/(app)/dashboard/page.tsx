import Link from "next/link";
import { Sparkles, Trophy, Wallet } from "lucide-react";
import { redirect } from "next/navigation";

import { BreakdownPie, WeeklySpendChart } from "@/components/dashboard/charts";
import { PetBadge } from "@/components/pets/pet-badge";
import { PetCelebration } from "@/components/pets/pet-celebration";
import { PetMoodCard } from "@/components/pets/pet-mood-card";
import { PetWarning } from "@/components/pets/pet-warning";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DAILY_LIMIT_MXN } from "@/lib/constants";
import { formatCurrencyMXN, formatHour } from "@/lib/format";
import { getPetTone } from "@/lib/pets";
import {
  getBetsSummary,
  getCorrelationSummary,
  getDailySummary,
  getHabitSummary,
  getPetBadges,
  getWeeklyRanking,
  getWeeklySummary
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

function statusBar(status: "green" | "yellow" | "red") {
  if (status === "green") return "bg-success";
  if (status === "yellow") return "bg-warning";
  return "bg-danger";
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [daily, weekly, habits, correlations, bets, ranking, petBadges] = await Promise.all([
    getDailySummary(),
    getWeeklySummary(user.id),
    getHabitSummary(),
    getCorrelationSummary(),
    getBetsSummary(),
    getWeeklyRanking(user.id),
    getPetBadges()
  ]);

  const narrative = getPetTone({
    status: daily.status,
    impulsiveCountToday: daily.impulsiveCountToday,
    hasActiveBet: bets.active.length > 0
  });

  return (
    <div className="space-y-4">
      <PetMoodCard narrative={narrative} />

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg">Control diario</CardTitle>
          <CardDescription>Limite diario: {formatCurrencyMXN(DAILY_LIMIT_MXN)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <p className="text-xs text-muted-foreground">Gastado hoy</p>
              <p className="text-xl font-semibold text-primary">{formatCurrencyMXN(daily.totalToday)}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <p className="text-xs text-muted-foreground">Restante</p>
              <p className="text-xl font-semibold text-primary">{formatCurrencyMXN(daily.remaining)}</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Semaforo diario</span>
              <span>{Math.round(daily.progress)}%</span>
            </div>
            <Progress value={daily.progress} indicatorClassName={statusBar(daily.status)} />
          </div>
          <div className="rounded-xl bg-slate-50 p-2 text-xs text-muted-foreground">
            Impulsos hoy: <span className="font-semibold text-primary">{daily.impulsiveCountToday}</span>
          </div>
          {daily.status === "red" ? (
            <PetWarning message="Tomasa dice: esto no esta aprobado." />
          ) : daily.status === "green" ? (
            <PetCelebration message="Equipo GJ en modo ganador." />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Acciones rapidas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Button asChild variant="secondary" className="h-12">
            <Link href="/gastos">+ Gasto</Link>
          </Button>
          <Button asChild variant="secondary" className="h-12">
            <Link href="/habitos">+ Habito</Link>
          </Button>
          <Button asChild className="h-12 bg-gamification text-white hover:bg-gamification/90">
            <Link href="/apuestas">+ Apuesta</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumen semanal</CardTitle>
            <CardDescription>
              Total: {formatCurrencyMXN(weekly.totalWeek)} · Promedio:{" "}
              {formatCurrencyMXN(weekly.dailyAverage)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklySpendChart data={weekly.byDay} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gasto por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <BreakdownPie data={weekly.byCategory} emptyLabel="Sin gastos esta semana." />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-border/70 bg-white p-3">
          <p className="mb-1 text-xs text-muted-foreground">Habitos hoy</p>
          <p className="text-lg font-semibold text-primary">{habits.doneToday}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white p-3">
          <p className="mb-1 text-xs text-muted-foreground">Racha ejercicio</p>
          <p className="text-lg font-semibold text-primary">{habits.exerciseStreak}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white p-3">
          <p className="mb-1 text-xs text-muted-foreground">Paseos Dante</p>
          <p className="text-lg font-semibold text-primary">{habits.danteWalksWeek}</p>
        </div>
        <div className="rounded-2xl border border-border/70 bg-white p-3">
          <p className="mb-1 text-xs text-muted-foreground">Consistencia</p>
          <p className="text-lg font-semibold text-primary">{Math.round(habits.consistencyPercent)}%</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apuestas activas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bets.active.length ? (
            bets.active.slice(0, 3).map((bet) => (
              <div key={bet.id} className="rounded-xl border border-border/70 bg-white p-3">
                <p className="text-sm font-semibold text-primary">{bet.title}</p>
                <p className="text-xs text-muted-foreground">
                  {bet.type} · {bet.penalty}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay apuestas activas.</p>
          )}
          <Button asChild variant="secondary" className="w-full">
            <Link href="/apuestas">Ver modulo de apuestas</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-4 w-4 text-gamification" />
            Ranking semanal y puntos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ranking.length ? (
            ranking.map((entry, index) => (
              <div key={entry.userId} className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-3 py-2">
                <p className="text-sm text-primary">
                  {index + 1}. <span className="font-semibold">{entry.label}</span>
                </p>
                <p className="text-sm font-semibold text-gamification">{entry.points} pts</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin ranking por ahora.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Badges de mascotas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3">
          {petBadges.map((badge) => (
            <PetBadge key={badge.id} badge={badge} />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Correlaciones clave</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-border/70 bg-white p-3">
            <p className="text-xs text-muted-foreground">Con ejercicio</p>
            <p className="text-base font-semibold text-success">
              {formatCurrencyMXN(correlations.avgWithExercise)}
            </p>
            <p className="text-xs text-muted-foreground">
              Sin ejercicio: {formatCurrencyMXN(correlations.avgWithoutExercise)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white p-3">
            <p className="text-xs text-muted-foreground">Con paseo de Dante</p>
            <p className="text-base font-semibold text-success">
              {formatCurrencyMXN(correlations.avgWithDante)}
            </p>
            <p className="text-xs text-muted-foreground">
              Sin paseo: {formatCurrencyMXN(correlations.avgWithoutDante)}
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white p-3">
            <p className="text-xs text-muted-foreground">Dias dentro de presupuesto</p>
            <p className="text-base font-semibold text-primary">
              {Math.round(correlations.budgetDaysRate)}%
            </p>
          </div>
          <div className="rounded-xl border border-border/70 bg-white p-3">
            <p className="text-xs text-muted-foreground">Habitos en dias sanos</p>
            <p className="text-base font-semibold text-primary">
              {correlations.habitsOnBudgetDays.toFixed(1)} / dia
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ultimos gastos</CardTitle>
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
                      {expense.description || "Sin descripcion"} · {formatHour(expense.spent_at)}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-primary">
                    {formatCurrencyMXN(Number(expense.amount))}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Aun no hay gastos registrados.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Atajos</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2 text-xs">
          <Link href="/gastos" className="rounded-xl border border-border/70 bg-white px-2 py-3 text-center text-primary">
            <Wallet className="mx-auto mb-1 h-4 w-4" />
            Gastos
          </Link>
          <Link href="/habitos" className="rounded-xl border border-border/70 bg-white px-2 py-3 text-center text-primary">
            <Sparkles className="mx-auto mb-1 h-4 w-4" />
            Habitos
          </Link>
          <Link href="/apuestas" className="rounded-xl border border-border/70 bg-white px-2 py-3 text-center text-primary">
            <Trophy className="mx-auto mb-1 h-4 w-4" />
            Apuestas
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
