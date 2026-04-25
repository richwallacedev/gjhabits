export const DAILY_LIMIT_MXN = 800;
export const GREEN_LIMIT_MXN = 500;

export const EXPENSE_CATEGORIES = [
  "Comida",
  "Uber / transporte",
  "Súper",
  "Antojo",
  "Salida",
  "Servicios",
  "Compras",
  "Otro"
] as const;

export const IMPULSIVE_CATEGORIES = ["Antojo", "Compras", "Salida"] as const;

export const PAYMENT_METHODS = [
  "Banorte Jorge",
  "BBVA Jorge",
  "Tarjeta Giss",
  "Efectivo",
  "Débito",
  "Otro"
] as const;

export const HABIT_TYPES = [
  "Ejercicio",
  "Paseo de Dante",
  "Comida en casa",
  "Día sin Uber",
  "Día dentro del presupuesto",
  "Otro"
] as const;

export const BET_TYPES = [
  "Diaria",
  "Semanal",
  "Por habito",
  "Por presupuesto",
  "Personalizada"
] as const;

export const BET_CONDITION_TYPES = [
  "Limite diario",
  "Meta semanal",
  "Frecuencia habito",
  "Control impulsos",
  "Personalizada"
] as const;

export const BET_PENALTIES = [
  "Paga cafe",
  "Paga desayuno",
  "Paga Uber",
  "Pasea a Dante",
  "Lava trastes",
  "Cocina cena",
  "El otro elige plan",
  "Dia sin antojos"
] as const;

export const BET_REWARDS = [
  "Elige plan del sabado",
  "Capricho sin culpa",
  "Noche de pelicula",
  "Postre permitido",
  "+50 puntos",
  "Badge especial"
] as const;

export type TrafficLightStatus = "green" | "yellow" | "red";
export type PetId = "dante" | "tomasa" | "lucien";
export type PetMood =
  | "happy"
  | "alert"
  | "angry"
  | "proud"
  | "guilty"
  | "sleepy"
  | "tempting";

export function getTrafficLightStatus(total: number): TrafficLightStatus {
  if (total <= GREEN_LIMIT_MXN) return "green";
  if (total <= DAILY_LIMIT_MXN) return "yellow";
  return "red";
}

export function getTrafficLightMessage(status: TrafficLightStatus) {
  if (status === "green") return "Van excelente";
  if (status === "yellow") return "Cuidado, ya casi";
  return "Se pasaron hoy";
}

export function getStatusColorClass(status: TrafficLightStatus) {
  if (status === "green") return "text-success";
  if (status === "yellow") return "text-warning";
  return "text-danger";
}

export function getKnownUserMap() {
  const gissId = process.env.NEXT_PUBLIC_GISS_USER_ID?.trim();
  const jorgeId = process.env.NEXT_PUBLIC_JORGE_USER_ID?.trim();

  const map = new Map<string, string>();
  if (gissId) map.set(gissId, "Giss");
  if (jorgeId) map.set(jorgeId, "Jorge");
  return map;
}
