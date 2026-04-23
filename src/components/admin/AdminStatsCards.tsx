import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Calendar, Users, Gauge, CalendarRange, Clock, TrendingUp } from "lucide-react";
import type { Reservation } from "@/hooks/useReservations";
import { todayLocalISO, parseLocalDate } from "@/lib/date-utils";
import { useMemo } from "react";

const DAILY_CAPACITY = 110;

interface Props {
  reservations: Reservation[];
  selectedDate?: string;
}

export const AdminStatsCards = ({ reservations, selectedDate }: Props) => {
  const stats = useMemo(() => {
    const targetDateISO = selectedDate || todayLocalISO();
    const isToday = targetDateISO === todayLocalISO();
    const targetDateObj = parseLocalDate(targetDateISO);
    targetDateObj.setHours(0, 0, 0, 0);
    
    const in7 = new Date(targetDateObj);
    in7.setDate(targetDateObj.getDate() + 7);

    const todays = reservations.filter((r) => r.date === targetDateISO && r.status !== "cancelled");
    const next7 = reservations.filter((r) => {
      if (r.status === "cancelled") return false;
      const d = parseLocalDate(r.date);
      return d >= targetDateObj && d <= in7;
    });
    const pending = reservations.filter((r) => (r.status ?? "pending") === "pending");

    const todayGuests = todays.reduce((s, r) => s + r.guests, 0);
    const todayPeople = reservations
      .filter((r) => r.date === targetDateISO && r.status !== "cancelled")
      .reduce((s, r) => s + r.guests, 0);

    return {
      isToday,
      todayCount: todays.length,
      todayPeople,
      occupancy: Math.min(100, Math.round((todayGuests / DAILY_CAPACITY) * 100)),
      occupancyValue: todayGuests,
      next7Count: next7.length,
      pendingCount: pending.length,
      estimatedRevenue: todayPeople * 80,
    };
  }, [reservations, selectedDate]);

  const occupancyTone =
    stats.occupancy >= 85
      ? "text-destructive"
      : stats.occupancy >= 50
      ? "text-accent"
      : "text-primary";

  const dayLabel = stats.isToday ? "hoje" : "na data";

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      <StatCard icon={Calendar} label={`Reservas ${dayLabel}`} value={stats.todayCount} />
      <StatCard icon={Users} label={`Pessoas ${dayLabel}`} value={stats.todayPeople} />
      <Card className="col-span-2 md:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Ocupação {dayLabel}</CardTitle>
          <Gauge className={`h-4 w-4 ${occupancyTone}`} />
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{stats.occupancyValue}<span className="text-sm text-muted-foreground">/{DAILY_CAPACITY}</span></span>
            <span className={`text-xs font-medium ${occupancyTone}`}>{stats.occupancy}%</span>
          </div>
          <Progress value={stats.occupancy} className="h-1.5" />
        </CardContent>
      </Card>
      <StatCard icon={CalendarRange} label="Próximos 7 dias" value={stats.next7Count} />
      <StatCard icon={Clock} label="Aguardando confirmar" value={stats.pendingCount} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-muted-foreground">Receita Estimada</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.estimatedRevenue)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">Ticket médio R$ 80</p>
        </CardContent>
      </Card>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: number }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-xs font-medium text-muted-foreground">{label}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);
