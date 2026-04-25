import {
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  format,
  startOfDay,
  startOfWeek,
  subDays
} from "date-fns";
import { es } from "date-fns/locale";

import {
  DAILY_LIMIT_MXN,
  IMPULSIVE_CATEGORIES,
  getKnownUserMap,
  getTrafficLightMessage,
  getTrafficLightStatus
} from "@/lib/constants";
import { displayUserLabel, toNumber } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type {
  BetResultRow,
  BetRow,
  BetSummary,
  CorrelationSummary,
  DailySummary,
  ExpenseRow,
  HabitRow,
  HabitSummary,
  PetBadgeStatus,
  WeeklyRankingEntry,
  WeeklySummary
} from "@/lib/types";

type HistoryFilters = {
  from?: string;
  to?: string;
  userId?: string;
  category?: string;
  paymentMethod?: string;
  limit?: number;
};

type ExportFilters = {
  from?: string;
  to?: string;
  userId?: string;
  category?: string;
  paymentMethod?: string;
  status?: string;
};

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function dateKeyFromIso(value: string) {
  return value.slice(0, 10);
}

function resolveRange(from?: string, to?: string) {
  const rangeFrom = from ? startOfDay(new Date(from)).toISOString() : undefined;
  const rangeTo = to ? endOfDay(new Date(to)).toISOString() : undefined;
  return { rangeFrom, rangeTo };
}

function weekWindow() {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  return { weekStart, weekEnd };
}

function isImpulsiveCategory(category: string) {
  return IMPULSIVE_CATEGORIES.includes(category as (typeof IMPULSIVE_CATEGORIES)[number]);
}

export async function getDailySummary(): Promise<DailySummary> {
  const supabase = await createClient();
  const now = new Date();
  const dayStart = startOfDay(now).toISOString();
  const dayEnd = endOfDay(now).toISOString();

  const [todayResult, latestResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("*")
      .gte("spent_at", dayStart)
      .lte("spent_at", dayEnd),
    supabase.from("expenses").select("*").order("spent_at", { ascending: false }).limit(8)
  ]);

  const todayRows = (todayResult.data ?? []) as ExpenseRow[];
  const latestRows = (latestResult.data ?? []) as ExpenseRow[];

  const totalToday = todayRows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const remaining = Math.max(0, DAILY_LIMIT_MXN - totalToday);
  const progress = Math.min((totalToday / DAILY_LIMIT_MXN) * 100, 100);
  const status = getTrafficLightStatus(totalToday);
  const message = getTrafficLightMessage(status);
  const impulsiveCountToday = todayRows.filter((row) => isImpulsiveCategory(row.category)).length;

  return {
    totalToday,
    remaining,
    progress,
    status,
    message,
    latestExpenses: latestRows,
    impulsiveCountToday
  };
}

export async function getWeeklySummary(currentUserId?: string): Promise<WeeklySummary> {
  const supabase = await createClient();
  const { weekStart, weekEnd } = weekWindow();

  const { data } = await supabase
    .from("expenses")
    .select("*")
    .gte("spent_at", weekStart.toISOString())
    .lte("spent_at", weekEnd.toISOString())
    .order("spent_at", { ascending: true });

  const rows = (data ?? []) as ExpenseRow[];
  const totalWeek = rows.reduce((sum, row) => sum + toNumber(row.amount), 0);
  const dailyAverage = totalWeek / 7;

  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const byDay = weekDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const amount = rows
      .filter((row) => dateKeyFromIso(row.spent_at) === key)
      .reduce((sum, row) => sum + toNumber(row.amount), 0);

    return {
      day: format(day, "EEE", { locale: es }),
      amount
    };
  });

  const categoryMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();
  const userMap = new Map<string, number>();

  rows.forEach((row) => {
    const amount = toNumber(row.amount);
    categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + amount);
    paymentMap.set(row.payment_method, (paymentMap.get(row.payment_method) ?? 0) + amount);
    userMap.set(row.user_id, (userMap.get(row.user_id) ?? 0) + amount);
  });

  const byCategory = [...categoryMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const byPaymentMethod = [...paymentMap.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const byUser = [...userMap.entries()]
    .map(([userId, value], index) => ({
      label: displayUserLabel(userId, { currentUserId, fallbackIndex: index }),
      value
    }))
    .sort((a, b) => b.value - a.value);

  return {
    totalWeek,
    dailyAverage,
    byDay,
    byCategory,
    byUser,
    byPaymentMethod
  };
}

export async function getHabitSummary(): Promise<HabitSummary> {
  const supabase = await createClient();
  const now = new Date();
  const dayStart = startOfDay(now).toISOString();
  const dayEnd = endOfDay(now).toISOString();
  const { weekStart, weekEnd } = weekWindow();
  const streakStart = subDays(now, 29);

  const [todayResult, weekResult, streakResult, latestResult] = await Promise.all([
    supabase
      .from("habits")
      .select("*")
      .gte("done_at", dayStart)
      .lte("done_at", dayEnd)
      .order("done_at", { ascending: false }),
    supabase
      .from("habits")
      .select("*")
      .gte("done_at", weekStart.toISOString())
      .lte("done_at", weekEnd.toISOString())
      .order("done_at", { ascending: false }),
    supabase
      .from("habits")
      .select("*")
      .eq("habit_type", "Ejercicio")
      .gte("done_at", startOfDay(streakStart).toISOString())
      .lte("done_at", dayEnd)
      .order("done_at", { ascending: false }),
    supabase.from("habits").select("*").order("done_at", { ascending: false }).limit(8)
  ]);

  const todayRows = (todayResult.data ?? []) as HabitRow[];
  const weekRows = (weekResult.data ?? []) as HabitRow[];
  const streakRows = (streakResult.data ?? []) as HabitRow[];
  const latestRows = (latestResult.data ?? []) as HabitRow[];

  const exerciseDays = new Set(streakRows.map((row) => dateKeyFromIso(row.done_at)));

  let exerciseStreak = 0;
  for (let i = 0; i < 30; i += 1) {
    const key = format(subDays(now, i), "yyyy-MM-dd");
    if (exerciseDays.has(key)) {
      exerciseStreak += 1;
    } else {
      break;
    }
  }

  const danteWalksWeek = weekRows.filter((row) => row.habit_type === "Paseo de Dante").length;
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const weeklyCalendar = weekDays.map((day) => {
    const key = format(day, "yyyy-MM-dd");
    const habitsCount = weekRows.filter((row) => dateKeyFromIso(row.done_at) === key).length;
    return {
      day: format(day, "EEE", { locale: es }),
      habitsCount,
      done: habitsCount > 0
    };
  });

  const consistencyPercent =
    (weeklyCalendar.filter((entry) => entry.done).length / weeklyCalendar.length) * 100;

  return {
    doneToday: todayRows.length,
    exerciseStreak,
    danteWalksWeek,
    consistencyPercent,
    weeklyCalendar,
    latestHabits: latestRows
  };
}

export async function getCorrelationSummary(): Promise<CorrelationSummary> {
  const supabase = await createClient();
  const now = new Date();
  const rangeStart = startOfDay(subDays(now, 29));
  const rangeEnd = endOfDay(now);

  const [expensesResult, habitsResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount,spent_at")
      .gte("spent_at", rangeStart.toISOString())
      .lte("spent_at", rangeEnd.toISOString()),
    supabase
      .from("habits")
      .select("habit_type,done_at")
      .gte("done_at", rangeStart.toISOString())
      .lte("done_at", rangeEnd.toISOString())
  ]);

  const expenses = (expensesResult.data ?? []) as Pick<ExpenseRow, "amount" | "spent_at">[];
  const habits = (habitsResult.data ?? []) as Pick<HabitRow, "habit_type" | "done_at">[];

  const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd }).map((day) =>
    format(day, "yyyy-MM-dd")
  );

  const byDay = new Map<
    string,
    { totalExpense: number; hasExercise: boolean; hasDante: boolean; habitsCount: number }
  >(
    days.map((day) => [
      day,
      { totalExpense: 0, hasExercise: false, hasDante: false, habitsCount: 0 }
    ])
  );

  expenses.forEach((expense) => {
    const key = dateKeyFromIso(expense.spent_at);
    const current = byDay.get(key);
    if (!current) return;
    current.totalExpense += toNumber(expense.amount);
  });

  habits.forEach((habit) => {
    const key = dateKeyFromIso(habit.done_at);
    const current = byDay.get(key);
    if (!current) return;
    current.habitsCount += 1;
    if (habit.habit_type === "Ejercicio") current.hasExercise = true;
    if (habit.habit_type === "Paseo de Dante") current.hasDante = true;
  });

  const withExercise: number[] = [];
  const withoutExercise: number[] = [];
  const withDante: number[] = [];
  const withoutDante: number[] = [];
  const habitsOnBudgetDays: number[] = [];
  const habitsOnOverBudgetDays: number[] = [];

  [...byDay.values()].forEach((entry) => {
    if (entry.hasExercise) withExercise.push(entry.totalExpense);
    else withoutExercise.push(entry.totalExpense);

    if (entry.hasDante) withDante.push(entry.totalExpense);
    else withoutDante.push(entry.totalExpense);

    if (entry.totalExpense <= DAILY_LIMIT_MXN) habitsOnBudgetDays.push(entry.habitsCount);
    else habitsOnOverBudgetDays.push(entry.habitsCount);
  });

  const budgetDaysRate =
    ([...byDay.values()].filter((entry) => entry.totalExpense <= DAILY_LIMIT_MXN).length /
      byDay.size) *
    100;

  return {
    avgWithExercise: average(withExercise),
    avgWithoutExercise: average(withoutExercise),
    avgWithDante: average(withDante),
    avgWithoutDante: average(withoutDante),
    budgetDaysRate,
    habitsOnBudgetDays: average(habitsOnBudgetDays),
    habitsOnOverBudgetDays: average(habitsOnOverBudgetDays)
  };
}

export async function getBetsSummary(): Promise<BetSummary> {
  const supabase = await createClient();

  const [activeResult, historyResult] = await Promise.all([
    supabase
      .from("bets")
      .select("*")
      .eq("status", "active")
      .order("ends_at", { ascending: true, nullsFirst: false })
      .limit(10),
    supabase
      .from("bets")
      .select("*")
      .neq("status", "active")
      .order("created_at", { ascending: false })
      .limit(20)
  ]);

  return {
    active: (activeResult.data ?? []) as BetRow[],
    history: (historyResult.data ?? []) as BetRow[]
  };
}

export async function getWeeklyRanking(currentUserId?: string): Promise<WeeklyRankingEntry[]> {
  const supabase = await createClient();
  const { weekStart, weekEnd } = weekWindow();

  const [habitsResult, betResultsResult] = await Promise.all([
    supabase
      .from("habits")
      .select("user_id,habit_type,done_at")
      .gte("done_at", weekStart.toISOString())
      .lte("done_at", weekEnd.toISOString()),
    supabase
      .from("bet_results")
      .select("user_id,points_change,created_at")
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", weekEnd.toISOString())
  ]);

  const habits = (habitsResult.data ?? []) as Pick<HabitRow, "user_id" | "habit_type">[];
  const betResults = (betResultsResult.data ?? []) as Pick<
    BetResultRow,
    "user_id" | "points_change"
  >[];

  const map = new Map<
    string,
    { habitPoints: number; betPoints: number; totalPoints: number; fallbackIndex: number }
  >();

  const addUser = (userId: string) => {
    if (!map.has(userId)) {
      map.set(userId, {
        habitPoints: 0,
        betPoints: 0,
        totalPoints: 0,
        fallbackIndex: map.size
      });
    }
    return map.get(userId)!;
  };

  habits.forEach((habit) => {
    const entry = addUser(habit.user_id);
    const gain = habit.habit_type === "Día dentro del presupuesto" ? 15 : 10;
    entry.habitPoints += gain;
    entry.totalPoints += gain;
  });

  betResults.forEach((result) => {
    const entry = addUser(result.user_id);
    entry.betPoints += result.points_change;
    entry.totalPoints += result.points_change;
  });

  if (currentUserId) {
    addUser(currentUserId);
  }

  const known = [...getKnownUserMap().keys()];
  known.forEach((id) => addUser(id));

  return [...map.entries()]
    .map(([userId, value]) => ({
      userId,
      label: displayUserLabel(userId, {
        currentUserId,
        fallbackIndex: value.fallbackIndex
      }),
      points: value.totalPoints,
      habitPoints: value.habitPoints,
      betPoints: value.betPoints
    }))
    .sort((a, b) => b.points - a.points);
}

export async function getPetBadges(): Promise<PetBadgeStatus[]> {
  const supabase = await createClient();
  const { weekStart, weekEnd } = weekWindow();

  const [expensesResult, habitsResult] = await Promise.all([
    supabase
      .from("expenses")
      .select("amount,category,spent_at")
      .gte("spent_at", weekStart.toISOString())
      .lte("spent_at", weekEnd.toISOString()),
    supabase
      .from("habits")
      .select("habit_type,done_at")
      .gte("done_at", weekStart.toISOString())
      .lte("done_at", weekEnd.toISOString())
  ]);

  const expenses = (expensesResult.data ?? []) as Pick<
    ExpenseRow,
    "amount" | "category" | "spent_at"
  >[];
  const habits = (habitsResult.data ?? []) as Pick<HabitRow, "habit_type" | "done_at">[];

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd }).map((day) =>
    format(day, "yyyy-MM-dd")
  );

  const byDay = new Map<
    string,
    { total: number; hasImpulse: boolean; habitsCount: number }
  >(days.map((day) => [day, { total: 0, hasImpulse: false, habitsCount: 0 }]));

  expenses.forEach((expense) => {
    const key = dateKeyFromIso(expense.spent_at);
    const current = byDay.get(key);
    if (!current) return;
    current.total += toNumber(expense.amount);
    if (isImpulsiveCategory(expense.category)) {
      current.hasImpulse = true;
    }
  });

  habits.forEach((habit) => {
    const key = dateKeyFromIso(habit.done_at);
    const current = byDay.get(key);
    if (!current) return;
    current.habitsCount += 1;
  });

  const danteWalks = habits.filter((habit) => habit.habit_type === "Paseo de Dante").length;
  const budgetDays = [...byDay.values()].filter((day) => day.total <= DAILY_LIMIT_MXN).length;
  const noImpulseDays = [...byDay.values()].filter((day) => !day.hasImpulse).length;
  const fullHabitWeek = [...byDay.values()].filter((day) => day.habitsCount > 0).length;

  return [
    {
      id: "dante_feliz",
      title: "Dante feliz",
      description: "Paseo registrado 3 veces",
      pet: "dante",
      unlocked: danteWalks >= 3,
      progressText: `${danteWalks}/3 paseos`
    },
    {
      id: "tomasa_aprueba",
      title: "Tomasa aprueba",
      description: "5 dias sin pasar presupuesto",
      pet: "tomasa",
      unlocked: budgetDays >= 5,
      progressText: `${budgetDays}/5 dias en control`
    },
    {
      id: "lucien_controlado",
      title: "Lucien controlado",
      description: "3 dias sin gasto impulsivo",
      pet: "lucien",
      unlocked: noImpulseDays >= 3,
      progressText: `${noImpulseDays}/3 dias sin impulso`
    },
    {
      id: "equipo_gj",
      title: "Equipo GJ",
      description: "Semana completa con habitos",
      pet: "dante",
      unlocked: fullHabitWeek === 7,
      progressText: `${fullHabitWeek}/7 dias activos`
    }
  ];
}

export async function getHistoryExpenses(filters: HistoryFilters = {}) {
  const supabase = await createClient();
  const limit = filters.limit ?? 150;
  const { rangeFrom, rangeTo } = resolveRange(filters.from, filters.to);

  let query = supabase
    .from("expenses")
    .select("*")
    .order("spent_at", { ascending: false })
    .limit(limit);

  if (rangeFrom) {
    query = query.gte("spent_at", rangeFrom);
  }
  if (rangeTo) {
    query = query.lte("spent_at", rangeTo);
  }
  if (filters.userId && filters.userId !== "all") {
    query = query.eq("user_id", filters.userId);
  }
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.paymentMethod && filters.paymentMethod !== "all") {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  const { data } = await query;
  return (data ?? []) as ExpenseRow[];
}

export async function getExpensesForExport(filters: ExportFilters = {}) {
  const supabase = await createClient();
  const { rangeFrom, rangeTo } = resolveRange(filters.from, filters.to);

  let query = supabase.from("expenses").select("*").order("spent_at", { ascending: true });

  if (rangeFrom) query = query.gte("spent_at", rangeFrom);
  if (rangeTo) query = query.lte("spent_at", rangeTo);
  if (filters.userId && filters.userId !== "all") query = query.eq("user_id", filters.userId);
  if (filters.category && filters.category !== "all") query = query.eq("category", filters.category);
  if (filters.paymentMethod && filters.paymentMethod !== "all") {
    query = query.eq("payment_method", filters.paymentMethod);
  }

  const { data } = await query;
  return (data ?? []) as ExpenseRow[];
}

export async function getHabitsForExport(filters: ExportFilters = {}) {
  const supabase = await createClient();
  const { rangeFrom, rangeTo } = resolveRange(filters.from, filters.to);

  let query = supabase.from("habits").select("*").order("done_at", { ascending: true });

  if (rangeFrom) query = query.gte("done_at", rangeFrom);
  if (rangeTo) query = query.lte("done_at", rangeTo);
  if (filters.userId && filters.userId !== "all") query = query.eq("user_id", filters.userId);

  const { data } = await query;
  return (data ?? []) as HabitRow[];
}

export async function getBetsForExport(filters: ExportFilters = {}) {
  const supabase = await createClient();
  const { rangeFrom, rangeTo } = resolveRange(filters.from, filters.to);

  let query = supabase.from("bets").select("*").order("created_at", { ascending: true });

  if (rangeFrom) query = query.gte("created_at", rangeFrom);
  if (rangeTo) query = query.lte("created_at", rangeTo);
  if (filters.userId && filters.userId !== "all") {
    query = query.or(`created_by.eq.${filters.userId},assigned_to.eq.${filters.userId}`);
  }
  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  const { data } = await query;
  return (data ?? []) as BetRow[];
}

export async function getPointsForExport(filters: ExportFilters = {}) {
  const supabase = await createClient();
  const { rangeFrom, rangeTo } = resolveRange(filters.from, filters.to);

  let habitsQuery = supabase.from("habits").select("user_id,habit_type,done_at");
  let betsQuery = supabase.from("bet_results").select("user_id,points_change,created_at");

  if (rangeFrom) {
    habitsQuery = habitsQuery.gte("done_at", rangeFrom);
    betsQuery = betsQuery.gte("created_at", rangeFrom);
  }
  if (rangeTo) {
    habitsQuery = habitsQuery.lte("done_at", rangeTo);
    betsQuery = betsQuery.lte("created_at", rangeTo);
  }
  if (filters.userId && filters.userId !== "all") {
    habitsQuery = habitsQuery.eq("user_id", filters.userId);
    betsQuery = betsQuery.eq("user_id", filters.userId);
  }

  const [habitsResult, betsResult] = await Promise.all([habitsQuery, betsQuery]);
  const habits = (habitsResult.data ?? []) as Pick<HabitRow, "user_id" | "habit_type">[];
  const betResults = (betsResult.data ?? []) as Pick<BetResultRow, "user_id" | "points_change">[];

  const map = new Map<string, { habitPoints: number; betPoints: number; total: number }>();
  const addUser = (userId: string) => {
    if (!map.has(userId)) {
      map.set(userId, { habitPoints: 0, betPoints: 0, total: 0 });
    }
    return map.get(userId)!;
  };

  habits.forEach((habit) => {
    const entry = addUser(habit.user_id);
    const gain = habit.habit_type === "Día dentro del presupuesto" ? 15 : 10;
    entry.habitPoints += gain;
    entry.total += gain;
  });

  betResults.forEach((betResult) => {
    const entry = addUser(betResult.user_id);
    entry.betPoints += betResult.points_change;
    entry.total += betResult.points_change;
  });

  return [...map.entries()].map(([userId, entry], index) => ({
    user_id: userId,
    user_label: displayUserLabel(userId, { fallbackIndex: index }),
    habit_points: entry.habitPoints,
    bet_points: entry.betPoints,
    total_points: entry.total
  }));
}
