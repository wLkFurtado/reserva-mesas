import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Download, CalendarX } from "lucide-react";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/date-utils";
import { useReservations, type Reservation } from "@/hooks/useReservations";
import { useBarReservations, type BarReservation } from "@/hooks/useBarReservations";
import { BARS } from "@/lib/bars";

type Row = {
  id: string;
  bar: "Tróia" | "Cabo Frio" | "São Pedro";
  name: string;
  email: string;
  phone: string;
  date: string;
  guests: number;
  local: string; // periodo or local
  status: string;
  created_at: string;
};

const statusLabel: Record<string, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};
const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  pending: "secondary",
  confirmed: "default",
  cancelled: "destructive",
};

const escapeCsv = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const barColor: Record<string, string> = {
  "Tróia": "bg-primary/15 text-primary border-primary/30",
  "Cabo Frio": "bg-accent/15 text-accent border-accent/30",
  "São Pedro": "bg-secondary/30 text-foreground border-secondary",
};

export const AllBarsPanel = ({ enabled }: { enabled: boolean }) => {
  const troia = useReservations(enabled);
  const cf = useBarReservations("cabofrio", enabled);
  const sp = useBarReservations("saopedro", enabled);

  const [search, setSearch] = useState("");
  const [barFilter, setBarFilter] = useState<string>("");
  const [dateFilter, setDateFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const rows: Row[] = useMemo(() => {
    const t: Row[] = (troia.data ?? []).map((r: Reservation) => ({
      id: r.id, bar: "Tróia", name: r.name, email: r.email, phone: r.phone, date: r.date,
      guests: r.guests, local: r.periodo === "tarde" ? "Tarde" : r.periodo === "noite" ? "Noite" : r.periodo,
      status: r.status ?? "pending", created_at: r.created_at,
    }));
    const c: Row[] = (cf.data ?? []).map((r: BarReservation) => ({
      id: r.id, bar: "Cabo Frio", name: r.name, email: r.email, phone: r.phone, date: r.date,
      guests: r.guests, local: r.local, status: r.status ?? "pending", created_at: r.created_at,
    }));
    const s: Row[] = (sp.data ?? []).map((r: BarReservation) => ({
      id: r.id, bar: "São Pedro", name: r.name, email: r.email, phone: r.phone, date: r.date,
      guests: r.guests, local: r.local, status: r.status ?? "pending", created_at: r.created_at,
    }));
    return [...t, ...c, ...s].sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : (a.created_at < b.created_at ? 1 : -1)
    );
  }, [troia.data, cf.data, sp.data]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (barFilter && r.bar !== barFilter) return false;
      if (dateFilter && r.date !== dateFilter) return false;
      if (statusFilter && r.status !== statusFilter) return false;
      if (search) {
        const t = search.toLowerCase();
        if (!r.name.toLowerCase().includes(t) && !r.email.toLowerCase().includes(t) && !r.phone.includes(search)) return false;
      }
      return true;
    });
  }, [rows, search, barFilter, dateFilter, statusFilter]);

  const totals = useMemo(() => ({
    troia: rows.filter((r) => r.bar === "Tróia").length,
    cabofrio: rows.filter((r) => r.bar === "Cabo Frio").length,
    saopedro: rows.filter((r) => r.bar === "São Pedro").length,
  }), [rows]);

  const loading = troia.isLoading || cf.isLoading || sp.isLoading;

  const exportCsv = () => {
    const headers = ["Bar", "Nome", "Email", "Telefone", "Pessoas", "Data", "Local/Período", "Status", "Criada em"];
    const data = filtered.map((r) => [
      r.bar, r.name, r.email, r.phone, r.guests,
      format(parseLocalDate(r.date), "dd/MM/yyyy"),
      r.local, statusLabel[r.status] ?? r.status,
      new Date(r.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...data].map((row) => row.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "reservas-todos-bares.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
        <p className="text-sm text-muted-foreground">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">Tróia</div>
          <div className="text-2xl font-bold">{totals.troia}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">{BARS.cabofrio.shortName}</div>
          <div className="text-2xl font-bold">{totals.cabofrio}</div>
        </div>
        <div className="rounded-lg border p-3">
          <div className="text-xs text-muted-foreground">{BARS.saopedro.shortName}</div>
          <div className="text-2xl font-bold">{totals.saopedro}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-end">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Buscar por nome, email ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={barFilter || "all"} onValueChange={(v) => setBarFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Bar" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os bares</SelectItem>
            <SelectItem value="Tróia">Tróia</SelectItem>
            <SelectItem value="Cabo Frio">Cabo Frio</SelectItem>
            <SelectItem value="São Pedro">São Pedro</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
        <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos status</SelectItem>
            <SelectItem value="pending">Pendente</SelectItem>
            <SelectItem value="confirmed">Confirmada</SelectItem>
            <SelectItem value="cancelled">Cancelada</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={exportCsv} disabled={filtered.length === 0}>
          <Download className="w-4 h-4 mr-2" /> CSV
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
          <CalendarX className="h-12 w-12 mx-auto text-primary/60 mb-3" />
          <p className="text-sm text-muted-foreground">Nenhuma reserva encontrada.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bar</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local / Período</TableHead>
                <TableHead>Pessoas</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={`${r.bar}-${r.id}`}>
                  <TableCell><Badge className={barColor[r.bar]} variant="outline">{r.bar}</Badge></TableCell>
                  <TableCell>
                    <div className="font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.email}</div>
                    <div className="text-xs text-muted-foreground">{r.phone}</div>
                  </TableCell>
                  <TableCell>{format(parseLocalDate(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell><Badge variant="outline">{r.local}</Badge></TableCell>
                  <TableCell>{r.guests}</TableCell>
                  <TableCell><Badge variant={statusVariant[r.status] ?? "secondary"}>{statusLabel[r.status] ?? r.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-muted-foreground">{filtered.length} reserva(s)</div>
    </div>
  );
};
