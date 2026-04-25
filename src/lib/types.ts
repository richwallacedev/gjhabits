import type {
  BET_CONDITION_TYPES,
  BET_TYPES,
  EXPENSE_CATEGORIES,
  HABIT_TYPES,
  PAYMENT_METHODS,
  PetId,
  PetMood
} from "@/lib/constants";

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export type HabitType = (typeof HABIT_TYPES)[number];
export type BetType = (typeof BET_TYPES)[number];
export type BetConditionType = (typeof BET_CONDITION_TYPES)[number];

export type ExpenseRow = {
  id: string;
  user_id: string;
  amount: number | string;
  category: ExpenseCategory | string;
  payment_method: PaymentMethod | string;
  description: string | null;
  spent_at: string;
  created_at: string;
};

export type HabitRow = {
  id: string;
  user_id: string;
  habit_type: HabitType | string;
  done_at: string;
  duration_minutes: number | null;
  note: string | null;
  created_at: string;
};

export type BetRow = {
  id: string;
  title: string;
  description: string | null;
  type: BetType | string;
  condition_type: BetConditionType | string;
  penalty: string;
  reward: string | null;
  created_by: string;
  assigned_to: string | null;
  starts_at: string | null;
  ends_at: string | null;
  status: "active" | "closed" | "cancelled" | string;
  winner_user_id: string | null;
  loser_user_id: string | null;
  created_at: string;
};

export type BetResultRow = {
  id: string;
  bet_id: string;
  user_id: string;
  result: string;
  points_change: number;
  notes: string | null;
  created_at: string;
};

export type DailySummary = {
  totalToday: number;
  remaining: number;
  progress: number;
  status: "green" | "yellow" | "red";
  message: string;
  latestExpenses: ExpenseRow[];
  impulsiveCountToday: number;
};

export type WeeklySummary = {
  totalWeek: number;
  dailyAverage: number;
  byDay: { day: string; amount: number }[];
  byCategory: { label: string; value: number }[];
  byUser: { label: string; value: number }[];
  byPaymentMethod: { label: string; value: number }[];
};

export type HabitSummary = {
  doneToday: number;
  exerciseStreak: number;
  danteWalksWeek: number;
  consistencyPercent: number;
  weeklyCalendar: { day: string; habitsCount: number; done: boolean }[];
  latestHabits: HabitRow[];
};

export type CorrelationSummary = {
  avgWithExercise: number;
  avgWithoutExercise: number;
  avgWithDante: number;
  avgWithoutDante: number;
  budgetDaysRate: number;
  habitsOnBudgetDays: number;
  habitsOnOverBudgetDays: number;
};

export type PetNarrative = {
  pet: PetId;
  mood: PetMood;
  title: string;
  message: string;
  secondaryPet?: PetId;
  secondaryMood?: PetMood;
  secondaryMessage?: string;
};

export type BetSummary = {
  active: BetRow[];
  history: BetRow[];
};

export type WeeklyRankingEntry = {
  userId: string;
  label: string;
  points: number;
  habitPoints: number;
  betPoints: number;
};

export type PetBadgeStatus = {
  id: "dante_feliz" | "tomasa_aprueba" | "lucien_controlado" | "equipo_gj";
  title: string;
  description: string;
  pet: PetId;
  unlocked: boolean;
  progressText: string;
};
