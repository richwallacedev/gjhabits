import type { PetId, PetMood, TrafficLightStatus } from "@/lib/constants";
import type { PetNarrative } from "@/lib/types";

type NarrativeInput = {
  status: TrafficLightStatus;
  impulsiveCountToday: number;
  hasActiveBet: boolean;
};

export const PET_NAMES: Record<PetId, string> = {
  dante: "Dante",
  tomasa: "Tomasa",
  lucien: "Lucien"
};

export const PET_ROLE: Record<PetId, string> = {
  dante: "Energia y celebracion",
  tomasa: "Control y disciplina",
  lucien: "Tentacion e impulsos"
};

export function getPetTone(input: NarrativeInput): PetNarrative {
  if (input.status === "green") {
    return {
      pet: "dante",
      mood: "happy",
      title: "Dia saludable",
      message: "Vamos excelente, Dante aprueba.",
      secondaryPet: "tomasa",
      secondaryMood: "proud",
      secondaryMessage: "Tomasa reviso y esta en orden."
    };
  }

  if (input.status === "yellow") {
    return {
      pet: "dante",
      mood: "alert",
      title: "Atencion suave",
      message: "Dante ya se puso alerta: aun estamos a tiempo.",
      secondaryPet: "lucien",
      secondaryMood: input.impulsiveCountToday > 0 ? "tempting" : "alert",
      secondaryMessage:
        input.impulsiveCountToday > 0
          ? "Lucien esta tentando otra compra."
          : "Lucien ronda cerca, controlen impulso."
    };
  }

  return {
    pet: "tomasa",
    mood: "angry",
    title: "Control urgente",
    message: "Tomasa dice: ya se pasaron.",
    secondaryPet: "dante",
    secondaryMood: "guilty",
    secondaryMessage: input.hasActiveBet
      ? "Tomasa va a validar la apuesta de hoy."
      : "Dante se quedo confundido con este cierre."
  };
}

export function getPetMessageByHabit(habitType: string) {
  if (habitType === "Paseo de Dante") {
    return {
      pet: "dante" as PetId,
      mood: "happy" as PetMood,
      message: "Paseo registrado. Dante feliz."
    };
  }

  if (habitType === "Día dentro del presupuesto") {
    return {
      pet: "tomasa" as PetId,
      mood: "proud" as PetMood,
      message: "Tomasa aprueba este dia de control."
    };
  }

  if (habitType === "Ejercicio") {
    return {
      pet: "dante" as PetId,
      mood: "proud" as PetMood,
      message: "Equipo GJ en modo ganador."
    };
  }

  return {
    pet: "lucien" as PetId,
    mood: "sleepy" as PetMood,
    message: "Lucien observa tranquilo."
  };
}

export function getPetMessageByExpenseCategory(category: string) {
  if (["Antojo", "Compras", "Salida"].includes(category)) {
    return {
      pet: "lucien" as PetId,
      mood: "tempting" as PetMood,
      message: "Lucien dice: solo uno mas..."
    };
  }

  if (category === "Uber / transporte") {
    return {
      pet: "tomasa" as PetId,
      mood: "alert" as PetMood,
      message: "Tomasa revisa este gasto de movilidad."
    };
  }

  return {
    pet: "dante" as PetId,
    mood: "happy" as PetMood,
    message: "Buen control, sigan asi."
  };
}

export function getPetReactionForBetResult(result: "won" | "lost" | "active") {
  if (result === "won") {
    return {
      pet: "dante" as PetId,
      mood: "happy" as PetMood,
      message: "Apuesta ganada. Dante celebra fuerte."
    };
  }
  if (result === "lost") {
    return {
      pet: "tomasa" as PetId,
      mood: "proud" as PetMood,
      message: "Se cumple la apuesta. Tomasa valida resultado."
    };
  }
  return {
    pet: "lucien" as PetId,
    mood: "alert" as PetMood,
    message: "Lucien esta al acecho hasta el cierre."
  };
}
