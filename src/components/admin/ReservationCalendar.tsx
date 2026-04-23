import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayLocalISO, toLocalISO } from "@/lib/date-utils";
import type { Reservation } from "@/hooks/useReservations";

const DAILY_CAPACITY = 110;
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface Props {
  reservations: Reservation[];
  onSelectDate: (isoDate: string) => void;
}

export const ReservationCalendar = ({ reservations, onSelectDate }: Props) => {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const occupancy = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of reservations) {
      if (r.status === "cancelled") continue;
      map.set(r.date, (map.get(r.date) ?? 0) + r.guests);
    }
    return map;
  }, [reservations]);

  const grid = useMemo(() => {
    const firstDay = new Date(cursor.year, cursor.month, 1);
    const lastDay = new Date(cursor.year, cursor.month + 1, 0);
    // Monday-first offset
    const startOffset = (firstDay.getDay() + 6) % 7;
    const cells: { date: Date | null; iso: string | null }[] = [];
    for (let i = 0; i < startOffset; i++) cells.push({ date: null, iso: null });
    for (let d = 1; d <= lastDay.getDate(); d++) {
      const date = new Date(cursor.year, cursor.month, d);
      cells.push({ date, iso: toLocalISO(date) });
    }
    while (cells.length % 7 !== 0) cells.push({ date: null, iso: null });
    return cells;
  }, [cursor]);

  const todayISO = todayLocalISO();

  const navigate = (delta: number) => {
    const m = cursor.month + delta;
    const y = cursor.year + Math.floor(m / 12);
    const newMonth = ((m % 12) + 12) % 12;
    setCursor({ year: y, month: newMonth });
  };

  const goToday = () => setCursor({ year: today.getFullYear(), month: today.getMonth() });

  const tone = (pct: number) => {
    if (pct >= 85) return "bg-destructive/15 border-destructive/40 text-destructive";
    if (pct >= 50) return "bg-accent/15 border-accent/40 text-accent";
    if (pct > 0) return "bg-primary/10 border-primary/30 text-primary";
    return "bg-muted/20 border-border text-muted-foreground";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold min-w-[200px] text-center">
            {MONTHS[cursor.month]} {cursor.year}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Hoje</Button>
          <div className="hidden sm:flex items-center gap-3 text-xs text-muted-foreground">
            <Legend tone="bg-primary/30" label="Baixa" />
            <Legend tone="bg-accent/40" label="Média" />
            <Legend tone="bg-destructive/40" label="Alta" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-xs font-medium text-muted-foreground text-center py-1">
            {w}
          </div>
        ))}
        {grid.map((cell, i) => {
          if (!cell.date || !cell.iso) {
            return <div key={i} className="aspect-square" />;
          }
          const booked = occupancy.get(cell.iso) ?? 0;
          const pct = Math.min(100, Math.round((booked / DAILY_CAPACITY) * 100));
          const isToday = cell.iso === todayISO;
          return (
            <button
              key={i}
              onClick={() => onSelectDate(cell.iso!)}
              className={cn(
                "aspect-square rounded-md border p-1.5 text-left transition-all hover:scale-[1.02] hover:shadow-md flex flex-col justify-between",
                tone(pct),
                isToday && "ring-2 ring-primary ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-start justify-between">
                <span className={cn("text-sm font-semibold", isToday && "text-primary")}>
                  {cell.date.getDate()}
                </span>
                {booked > 0 && (
                  <span className="text-[10px] font-medium opacity-80">{pct}%</span>
                )}
              </div>
              <div className="text-[10px] font-medium">
                {booked > 0 ? `${booked}/${DAILY_CAPACITY}` : "—"}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Legend = ({ tone, label }: { tone: string; label: string }) => (
  <span className="flex items-center gap-1">
    <span className={cn("inline-block h-2.5 w-2.5 rounded", tone)} />
    {label}
  </span>
);
