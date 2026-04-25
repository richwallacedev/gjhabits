import { format } from "date-fns";
import { es } from "date-fns/locale";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

import { BottomTabs } from "@/components/layout/bottom-tabs";
import { FloatingActions } from "@/components/layout/floating-actions";
import { PetAvatar } from "@/components/pets/pet-avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

type AppLayoutProps = {
  children: React.ReactNode;
};

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: AppLayoutProps) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  async function signOut() {
    "use server";
    const serverClient = await createClient();
    await serverClient.auth.signOut();
    redirect("/login");
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <PetAvatar pet="dante" mood="happy" size="sm" />
            <div>
              <p className="text-sm font-semibold text-primary">GJ Habits</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
              </p>
            </div>
          </div>
          <form action={signOut}>
            <Button variant="ghost" size="sm" className="gap-1.5">
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </form>
        </div>
      </header>

      <main className="safe-bottom px-4 py-4">{children}</main>
      <FloatingActions />
      <BottomTabs />
    </div>
  );
}
