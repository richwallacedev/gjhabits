import { format } from "date-fns";
import * as XLSX from "xlsx";

import { displayUserLabel, toNumber } from "@/lib/format";
import {
  getBetsForExport,
  getExpensesForExport,
  getHabitsForExport,
  getPointsForExport
} from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";

type Dataset = "expenses" | "habits" | "bets" | "points";

function filenameFor(dataset: Dataset) {
  const date = format(new Date(), "yyyy-MM-dd");
  if (dataset === "expenses") return `gj-habits-gastos-${date}.xlsx`;
  if (dataset === "habits") return `gj-habits-habitos-${date}.xlsx`;
  if (dataset === "bets") return `gj-habits-apuestas-${date}.xlsx`;
  return `gj-habits-puntos-${date}.xlsx`;
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  const datasetParam = url.searchParams.get("dataset");
  const dataset: Dataset =
    datasetParam === "habits" ||
    datasetParam === "bets" ||
    datasetParam === "points"
      ? datasetParam
      : "expenses";
  const from = url.searchParams.get("from") ?? undefined;
  const to = url.searchParams.get("to") ?? undefined;
  const userId = url.searchParams.get("user") ?? undefined;
  const category = url.searchParams.get("category") ?? undefined;
  const paymentMethod = url.searchParams.get("payment") ?? undefined;
  const status = url.searchParams.get("status") ?? undefined;

  let rows: Record<string, unknown>[] = [];

  if (dataset === "expenses") {
    const expenses = await getExpensesForExport({
      from,
      to,
      userId,
      category,
      paymentMethod
    });

    rows = expenses.map((expense, index) => {
      const date = new Date(expense.spent_at);
      return {
        Fecha: format(date, "yyyy-MM-dd"),
        Hora: format(date, "HH:mm"),
        Usuario: displayUserLabel(expense.user_id, {
          currentUserId: user.id,
          fallbackIndex: index
        }),
        Categoria: expense.category,
        "Metodo de pago": expense.payment_method,
        Descripcion: expense.description || "",
        Monto: toNumber(expense.amount)
      };
    });
  }

  if (dataset === "habits") {
    const habits = await getHabitsForExport({ from, to, userId });

    rows = habits.map((habit, index) => {
      const date = new Date(habit.done_at);
      return {
        Fecha: format(date, "yyyy-MM-dd"),
        Hora: format(date, "HH:mm"),
        Usuario: displayUserLabel(habit.user_id, {
          currentUserId: user.id,
          fallbackIndex: index
        }),
        Habito: habit.habit_type,
        "Duracion min": habit.duration_minutes ?? 0,
        Nota: habit.note || ""
      };
    });
  }

  if (dataset === "bets") {
    const bets = await getBetsForExport({ from, to, userId, status });

    rows = bets.map((bet, index) => ({
      Titulo: bet.title,
      Tipo: bet.type,
      Condicion: bet.condition_type,
      Estado: bet.status,
      Castigo: bet.penalty,
      Recompensa: bet.reward || "",
      Creador: displayUserLabel(bet.created_by, { fallbackIndex: index }),
      Asignado: bet.assigned_to ? displayUserLabel(bet.assigned_to) : "Equipo",
      Ganador: bet.winner_user_id ? displayUserLabel(bet.winner_user_id) : "",
      Perdedor: bet.loser_user_id ? displayUserLabel(bet.loser_user_id) : "",
      Inicio: bet.starts_at ? format(new Date(bet.starts_at), "yyyy-MM-dd HH:mm") : "",
      Fin: bet.ends_at ? format(new Date(bet.ends_at), "yyyy-MM-dd HH:mm") : "",
      Creada: format(new Date(bet.created_at), "yyyy-MM-dd HH:mm")
    }));
  }

  if (dataset === "points") {
    const points = await getPointsForExport({ from, to, userId });
    rows = points.map((entry) => ({
      Usuario: entry.user_label,
      "Puntos habitos": entry.habit_points,
      "Puntos apuestas": entry.bet_points,
      "Puntos totales": entry.total_points
    }));
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
  const data = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const filename = filenameFor(dataset);

  return new Response(data, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store"
    }
  });
}
