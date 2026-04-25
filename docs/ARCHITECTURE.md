# GJ Habits - Arquitectura V2

## 1) Vision
GJ Habits combina 4 capas en una sola PWA:
- fintech diaria (gastos + presupuesto)
- sistema de habitos
- apuestas sanas de pareja
- narrativa emocional con mascotas (Dante, Tomasa, Lucien)

Meta UX:
- registro en menos de 5 segundos
- lectura rapida en movil
- feedback emocional sin perder claridad financiera

## 2) Stack
- Next.js App Router
- Supabase Auth + Postgres + RLS
- Tailwind + shadcn/ui
- lucide-react
- recharts
- xlsx
- framer-motion

## 3) Rutas principales
- `/login`
- `/dashboard`
- `/gastos`
- `/habitos`
- `/apuestas`
- `/historial`
- `/exportar`
- `/api/export`

## 4) Modelo de datos
Tablas:
- `expenses`
- `habits`
- `bets`
- `bet_results`

Principio de seguridad:
- lectura compartida para miembros GJ
- escritura autenticada por usuario
- RLS en todas las tablas

## 5) Capa narrativa de mascotas
### Componentes reutilizables
- `PetAvatar`
- `PetMascot`
- `PetMessage`
- `PetReaction`
- `PetBadge`
- `PetCelebration`
- `PetWarning`
- `PetMoodCard`
- `PetHabitIcon`

### Motor narrativo
`lib/pets.ts` decide mascota + mood + mensaje segun:
- semaforo diario
- gastos impulsivos
- estado de apuestas
- tipo de habito

## 6) Modulo de apuestas sanas
Funciones:
- crear apuesta
- listar activas
- historial
- cerrar resultado (ganador/perdedor)
- generar `bet_results` (+/- puntos)

Implementacion:
- `createBetAction`
- `resolveBetAction`
- UI en `/apuestas` con formulario rapido + tarjetas de cierre

## 7) Dashboard V2
Incluye:
- gasto diario + semaforo
- mensaje mascota contextual
- habitos de hoy
- apuestas activas
- ranking semanal (habitos + apuestas)
- badges de mascotas
- quick actions

## 8) Gamificacion
Puntos semanales:
- habitos: +10 base (+15 para "Dia dentro del presupuesto")
- apuestas: `bet_results.points_change`

Badges:
- Dante feliz
- Tomasa aprueba
- Lucien controlado
- Equipo GJ

## 9) Exportacion Excel
Dataset seleccionable:
- gastos
- habitos
- apuestas
- puntos

Soportado por `/api/export` con filtros por fecha/usuario y extras por modulo.
