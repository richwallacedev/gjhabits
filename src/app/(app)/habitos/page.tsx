import { Flame, Footprints, Target } from "lucide-react";

import { HabitQuickForm } from "@/components/habits/habit-quick-form";
import { PetHabitIcon } from "@/components/pets/pet-habit-icon";
import { PetMessage } from "@/components/pets/pet-message";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFullDateTime } from "@/lib/format";
import { getHabitSummary } from "@/lib/queries";

export default async function HabitosPage() {
  const habits = await getHabitSummary();

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dashboard de habitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PetMessage pet="dante" mood="proud" message="Dante ya quiere salir a caminar." />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <div className="mb-2 inline-flex rounded-xl bg-primary/10 p-2 text-primary">
                <Target className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">Completados hoy</p>
              <p className="text-lg font-semibold">{habits.doneToday}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <div className="mb-2 inline-flex rounded-xl bg-success/10 p-2 text-success">
                <Flame className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">Racha ejercicio</p>
              <p className="text-lg font-semibold">{habits.exerciseStreak} dias</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <div className="mb-2 inline-flex rounded-xl bg-warning/10 p-2 text-warning">
                <Footprints className="h-4 w-4" />
              </div>
              <p className="text-xs text-muted-foreground">Paseos de Dante</p>
              <p className="text-lg font-semibold">{habits.danteWalksWeek}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-white p-3">
              <p className="mb-2 text-xs text-muted-foreground">Consistencia</p>
              <p className="text-lg font-semibold">{Math.round(habits.consistencyPercent)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Calendario semanal</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-7 gap-2">
          {habits.weeklyCalendar.map((day) => (
            <div
              key={day.day}
              className={`rounded-xl border p-2 text-center ${
                day.done ? "border-success/40 bg-success/10" : "border-border/70 bg-white"
              }`}
            >
              <p className="text-[11px] text-muted-foreground">{day.day}</p>
              <p className="text-sm font-semibold text-primary">{day.habitsCount}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <HabitQuickForm />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ultimos habitos</CardTitle>
        </CardHeader>
        <CardContent>
          {habits.latestHabits.length ? (
            <ul className="space-y-2">
              {habits.latestHabits.map((habit) => (
                <li
                  key={habit.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-border/70 bg-white p-3 text-sm"
                >
                  <div className="flex items-start gap-2">
                    <PetHabitIcon habitType={habit.habit_type} size="sm" />
                    <div>
                      <p className="font-medium text-primary">{habit.habit_type}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFullDateTime(habit.done_at)}
                        {habit.duration_minutes ? ` · ${habit.duration_minutes} min` : ""}
                      </p>
                      {habit.note ? (
                        <p className="mt-1 text-xs text-muted-foreground">{habit.note}</p>
                      ) : null}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Sin habitos registrados todavia.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
