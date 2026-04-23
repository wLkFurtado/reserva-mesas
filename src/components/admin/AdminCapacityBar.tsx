import { Progress } from "@/components/ui/progress";
import { useReservationStatusByPeriod } from "@/hooks/useReservations";
import { formatDateToDisplay } from "@/lib/date-utils";
import { Sun, Moon } from "lucide-react";

interface Props {
  date: string;
}

export const AdminCapacityBar = ({ date }: Props) => {
  const { data, isLoading } = useReservationStatusByPeriod(date);

  if (!date) return null;
  if (isLoading || !data) {
    return (
      <div className="rounded-lg border bg-card p-3 text-xs text-muted-foreground">
        Carregando capacidade do dia...
      </div>
    );
  }

  const cap = data.capacity || 110;
  const tarde = Math.round((data.tarde.booked / cap) * 100);
  const noite = Math.round((data.noite.booked / cap) * 100);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Capacidade · {formatDateToDisplay(date)}</span>
        <span className="text-muted-foreground">
          Total: {data.total.booked}/{cap}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <PeriodBar icon={<Sun className="h-3.5 w-3.5 text-accent" />} label="Tarde" booked={data.tarde.booked} cap={cap} pct={tarde} />
        <PeriodBar icon={<Moon className="h-3.5 w-3.5 text-primary" />} label="Noite" booked={data.noite.booked} cap={cap} pct={noite} />
      </div>
    </div>
  );
};

const PeriodBar = ({ icon, label, booked, cap, pct }: { icon: React.ReactNode; label: string; booked: number; cap: number; pct: number }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="flex items-center gap-1.5 font-medium">{icon} {label}</span>
      <span className="text-muted-foreground">{booked}/{cap} · {pct}%</span>
    </div>
    <Progress value={pct} className="h-1.5" />
  </div>
);
