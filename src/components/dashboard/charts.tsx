"use client";

import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

import { formatCurrencyMXN } from "@/lib/format";

const palette = ["#0F172A", "#22C55E", "#F59E0B", "#EF4444", "#38BDF8", "#A855F7"];

type BarDatum = { day: string; amount: number };
type PieDatum = { label: string; value: number };

export function WeeklySpendChart({ data }: { data: BarDatum[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `$${value}`} tickLine={false} axisLine={false} />
          <Tooltip formatter={(value: number) => formatCurrencyMXN(value)} />
          <Bar dataKey="amount" radius={[8, 8, 0, 0]} fill="#0F172A" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BreakdownPie({
  data,
  emptyLabel
}: {
  data: PieDatum[];
  emptyLabel: string;
}) {
  if (!data.length) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  return (
    <div className="h-60 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" outerRadius={86}>
            {data.map((entry, index) => (
              <Cell key={entry.label} fill={palette[index % palette.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: number) => formatCurrencyMXN(value)} />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 grid gap-1 text-xs">
        {data.slice(0, 5).map((item, index) => (
          <li key={item.label} className="flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: palette[index % palette.length] }}
              />
              {item.label}
            </span>
            <span className="font-medium text-primary">{formatCurrencyMXN(item.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
