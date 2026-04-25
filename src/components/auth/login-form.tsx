"use client";

import { useActionState } from "react";

import type { LoginActionState } from "@/app/(auth)/actions";
import { loginAction } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialState: LoginActionState = {
  status: "idle"
};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <Card className="w-full max-w-md bg-white/95">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Bienvenidos a GJ Habits</CardTitle>
        <p className="text-sm text-muted-foreground">
          Inicien sesión para registrar gastos y hábitos en segundos.
        </p>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="giss@correo.com"
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="******"
              autoComplete="current-password"
              required
            />
          </div>
          {state.status === "error" && state.message ? (
            <p className="rounded-xl bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.message}
            </p>
          ) : null}
          <Button type="submit" className="w-full" size="lg" disabled={pending}>
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
