import { Flame, Trophy } from "lucide-react";
import { redirect } from "next/navigation";

import { BetCard } from "@/components/bets/bet-card";
import { BetQuickForm } from "@/components/bets/bet-quick-form";
import { PetMessage } from "@/components/pets/pet-message";
import { PetMascot } from "@/components/pets/pet-mascot";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKnownUserMap } from "@/lib/constants";
import { getBetsSummary, getWeeklyRanking } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function ApuestasPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [bets, ranking] = await Promise.all([
    getBetsSummary(),
    getWeeklyRanking(user.id)
  ]);

  const userOptions = [...getKnownUserMap().entries()].map(([value, label]) => ({
    value,
    label
  }));

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Flame className="h-4 w-4 text-gamification" />
            Apuestas sanas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <PetMascot pet="tomasa" mood="proud" />
          <PetMessage
            pet="tomasa"
            mood="proud"
            message="Compromisos ligeros, reglas claras, cierre sin drama."
          />
          <div className="rounded-2xl border border-border/70 bg-white p-3">
            <p className="text-xs text-muted-foreground">Activas ahora</p>
            <p className="text-xl font-semibold text-primary">{bets.active.length}</p>
          </div>
        </CardContent>
      </Card>

      <BetQuickForm userOptions={userOptions} />

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Apuestas activas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bets.active.length ? (
            bets.active.map((bet) => (
              <BetCard key={bet.id} bet={bet} userOptions={userOptions} currentUserId={user.id} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No hay apuestas activas por ahora.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ranking semanal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ranking.length ? (
            ranking.map((entry, index) => (
              <div
                key={entry.userId}
                className="flex items-center justify-between rounded-xl border border-border/70 bg-white px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <div className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary">{entry.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Habitos: {entry.habitPoints} · Apuestas: {entry.betPoints}
                    </p>
                  </div>
                </div>
                <p className="flex items-center gap-1 text-sm font-semibold text-gamification">
                  <Trophy className="h-4 w-4" />
                  {entry.points}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Aun no hay puntos esta semana.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Historial de apuestas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {bets.history.length ? (
            bets.history.map((bet) => (
              <BetCard key={bet.id} bet={bet} userOptions={userOptions} currentUserId={user.id} />
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Sin historial aun.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
