"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  BET_CONDITION_TYPES,
  BET_TYPES,
  EXPENSE_CATEGORIES,
  HABIT_TYPES,
  PAYMENT_METHODS
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export type MutationState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const expenseSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  category: z.enum(EXPENSE_CATEGORIES),
  payment_method: z.enum(PAYMENT_METHODS),
  description: z.string().max(160).optional(),
  spent_at: z.string().optional()
});

const habitSchema = z.object({
  habit_type: z.enum(HABIT_TYPES),
  done_at: z.string().optional(),
  duration_minutes: z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce.number().int().min(0).max(720).optional()
  ),
  note: z.string().max(160).optional()
});

const betSchema = z.object({
  title: z.string().min(4, "Define un titulo mas claro").max(90),
  description: z.string().max(220).optional(),
  type: z.enum(BET_TYPES),
  condition_type: z.enum(BET_CONDITION_TYPES),
  penalty: z.string().min(3, "Agrega un castigo"),
  reward: z.string().max(120).optional(),
  assigned_to: z.string().uuid().optional().or(z.literal("")),
  starts_at: z.string().optional(),
  ends_at: z.string().optional()
});

const resolveBetSchema = z.object({
  bet_id: z.string().uuid(),
  winner_user_id: z.string().uuid("Selecciona ganador"),
  loser_user_id: z.string().uuid("Selecciona perdedor"),
  winner_points: z.coerce.number().int().min(5).max(200).default(50),
  loser_points: z.coerce.number().int().min(1).max(150).default(20),
  notes: z.string().max(160).optional()
});

function revalidateCorePaths() {
  revalidatePath("/dashboard");
  revalidatePath("/gastos");
  revalidatePath("/habitos");
  revalidatePath("/historial");
  revalidatePath("/exportar");
  revalidatePath("/apuestas");
}

export async function createExpenseAction(
  _prevState: MutationState,
  formData: FormData
): Promise<MutationState> {
  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    category: formData.get("category"),
    payment_method: formData.get("payment_method"),
    description: formData.get("description") ?? "",
    spent_at: formData.get("spent_at") ?? ""
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo registrar el gasto."
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const spentAt = parsed.data.spent_at
    ? new Date(parsed.data.spent_at).toISOString()
    : new Date().toISOString();

  const { error } = await supabase.from("expenses").insert({
    user_id: user.id,
    amount: parsed.data.amount,
    category: parsed.data.category,
    payment_method: parsed.data.payment_method,
    description: parsed.data.description || null,
    spent_at: spentAt
  });

  if (error) {
    return { status: "error", message: "No se pudo guardar el gasto." };
  }

  revalidateCorePaths();
  return { status: "success", message: "Gasto registrado." };
}

export async function createHabitAction(
  _prevState: MutationState,
  formData: FormData
): Promise<MutationState> {
  const parsed = habitSchema.safeParse({
    habit_type: formData.get("habit_type"),
    done_at: formData.get("done_at") ?? "",
    duration_minutes: formData.get("duration_minutes") ?? undefined,
    note: formData.get("note") ?? ""
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo registrar el habito."
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const doneAt = parsed.data.done_at
    ? new Date(parsed.data.done_at).toISOString()
    : new Date().toISOString();

  const { error } = await supabase.from("habits").insert({
    user_id: user.id,
    habit_type: parsed.data.habit_type,
    done_at: doneAt,
    duration_minutes:
      typeof parsed.data.duration_minutes === "number"
        ? parsed.data.duration_minutes
        : null,
    note: parsed.data.note || null
  });

  if (error) {
    return { status: "error", message: "No se pudo guardar el habito." };
  }

  revalidateCorePaths();
  return { status: "success", message: "Habito registrado." };
}

export async function createBetAction(
  _prevState: MutationState,
  formData: FormData
): Promise<MutationState> {
  const parsed = betSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    type: formData.get("type"),
    condition_type: formData.get("condition_type"),
    penalty: formData.get("penalty"),
    reward: formData.get("reward") ?? "",
    assigned_to: formData.get("assigned_to") ?? "",
    starts_at: formData.get("starts_at") ?? "",
    ends_at: formData.get("ends_at") ?? ""
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo crear la apuesta."
    };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const { error } = await supabase.from("bets").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    type: parsed.data.type,
    condition_type: parsed.data.condition_type,
    penalty: parsed.data.penalty,
    reward: parsed.data.reward || null,
    created_by: user.id,
    assigned_to: parsed.data.assigned_to || null,
    starts_at: parsed.data.starts_at
      ? new Date(parsed.data.starts_at).toISOString()
      : new Date().toISOString(),
    ends_at: parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null,
    status: "active"
  });

  if (error) {
    return { status: "error", message: "No se pudo guardar la apuesta." };
  }

  revalidateCorePaths();
  return { status: "success", message: "Apuesta activa. Equipo GJ en juego." };
}

export async function resolveBetAction(
  _prevState: MutationState,
  formData: FormData
): Promise<MutationState> {
  const parsed = resolveBetSchema.safeParse({
    bet_id: formData.get("bet_id"),
    winner_user_id: formData.get("winner_user_id"),
    loser_user_id: formData.get("loser_user_id"),
    winner_points: formData.get("winner_points") ?? 50,
    loser_points: formData.get("loser_points") ?? 20,
    notes: formData.get("notes") ?? ""
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "No se pudo cerrar la apuesta."
    };
  }

  if (parsed.data.winner_user_id === parsed.data.loser_user_id) {
    return { status: "error", message: "Ganador y perdedor deben ser distintos." };
  }

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return { status: "error", message: "Tu sesion expiro. Vuelve a iniciar sesion." };
  }

  const { error: updateError } = await supabase
    .from("bets")
    .update({
      status: "closed",
      winner_user_id: parsed.data.winner_user_id,
      loser_user_id: parsed.data.loser_user_id
    })
    .eq("id", parsed.data.bet_id)
    .eq("status", "active");

  if (updateError) {
    return { status: "error", message: "No se pudo actualizar la apuesta." };
  }

  const { error: resultError } = await supabase.from("bet_results").insert([
    {
      bet_id: parsed.data.bet_id,
      user_id: parsed.data.winner_user_id,
      result: "winner",
      points_change: parsed.data.winner_points,
      notes: parsed.data.notes || null
    },
    {
      bet_id: parsed.data.bet_id,
      user_id: parsed.data.loser_user_id,
      result: "loser",
      points_change: -Math.abs(parsed.data.loser_points),
      notes: parsed.data.notes || null
    }
  ]);

  if (resultError) {
    return { status: "error", message: "No se pudieron registrar puntos de apuesta." };
  }

  revalidateCorePaths();
  return { status: "success", message: "Apuesta cerrada con resultado validado por Tomasa." };
}
