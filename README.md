# GJ Habits (PWA)

PWA mobile-first para Giss y Jorge con identidad propia:
- control de gastos
- habitos
- apuestas sanas
- puntos y ranking semanal
- exportacion Excel
- narrativa con mascotas: Dante, Tomasa y Lucien

## Stack
- Next.js (App Router)
- Supabase (Auth + Postgres + RLS)
- Tailwind CSS + shadcn/ui
- lucide-react
- recharts
- xlsx
- framer-motion

---

## 1) Variables de entorno
Crea `.env.local` desde `.env.example`.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_GISS_USER_ID=...
NEXT_PUBLIC_JORGE_USER_ID=...
```

---

## 2) Supabase: setup rapido
1. Crea proyecto en Supabase.
2. Crea usuarios de Giss y Jorge en `Authentication > Users`.
3. Ejecuta `supabase/schema.sql` en SQL Editor.

El script crea:
- `expenses`
- `habits`
- `bets`
- `bet_results`
- indices + RLS + politicas

---

## 3) Ejecutar local
```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

---

## 4) Modulos principales

### Dashboard
- total gastado hoy
- semaforo diario y mensaje de mascota
- habitos de hoy
- apuestas activas
- ranking semanal
- badges de mascotas
- quick actions: gasto, habito, apuesta

### Gastos
- registro rapido (<5s)
- feedback narrativo segun categoria y estado
- alertas de control

### Habitos
- registro rapido
- calendario semanal visual
- protagonismo de Dante en "Paseo de Dante"

### Apuestas
- crear apuesta sana
- activas e historial
- cierre con ganador/perdedor
- puntos +/-
- reaccion de mascotas segun resultado

### Exportar
Dataset seleccionable:
- gastos
- habitos
- apuestas
- puntos

---

## 5) Exportacion Excel
Ruta: `/api/export`

Parametros:
- `dataset`: `expenses | habits | bets | points`
- `from`, `to`
- `user`
- `category`, `payment` (gastos)
- `status` (apuestas)

---

## 6) Deploy en Vercel
1. Sube el repo a GitHub.
2. Importa el proyecto en Vercel.
3. Configura variables de entorno.
4. Deploy.

---

## 7) Notas de diseno
Paleta base:
- Fondo `#F8FAFC`
- Primario `#0F172A`
- Verde `#22C55E`
- Amarillo `#F59E0B`
- Rojo `#EF4444`
- Morado gamificacion `#8B5CF6`
- Azul habitos `#38BDF8`
- Crema mascotas `#FFF7ED`

Mascotas:
- Dante: energia y celebracion
- Tomasa: control y disciplina
- Lucien: impulso y tentacion
