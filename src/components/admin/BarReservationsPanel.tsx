import { useMemo, useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CalendarX, Trash2, Download, Plus } from "lucide-react";
import { AdminBarReservationForm } from "./AdminBarReservationForm";
import { format } from "date-fns";
import { parseLocalDate } from "@/lib/date-utils";
import { toast } from "@/hooks/use-toast";
import { BARS, type BarId } from "@/lib/bars";
import {
  useBarReservations, useUpdateBarReservation, useDeleteBarReservation,
  type BarReservation, type BarReservationStatus,
} from "@/hooks/useBarReservations";

const statusMeta: Record<BarReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

const escapeCsv = (v: unknown) => {
  const s = v == null ? "" : String(v);
  return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

interface Props {
  bar: BarId;
  showBarLabel?: boolean;
  data?: BarReservation[];
  loading?: boolean;
  hideFilters?: boolean;
}

export const BarReservationsPanel = ({ bar, showBarLabel, data, loading, hideFilters }: Props) => {
  const cfg = BARS[bar];
  const own = useBarReservations(bar, !data);
  const reservations = data ?? own.data ?? [];
  const isLoading = loading ?? own.isLoading;

  const update = useUpdateBarReservation(bar);
  const del = useDeleteBarReservation(bar);

  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [localFilter, setLocalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<BarReservation | null>(null);

  const filtered = useMemo(() => {
    return reservations.filter((r) => {
      if (search) {
        const t = search.toLowerCase();
        if (!r.name.toLowerCase().includes(t) && !r.email.toLowerCase().includes(t) && !r.phone.includes(search)) return false;
      }
      if (dateFilter && r.date !== dateFilter) return false;
      if (localFilter && r.local !== localFilter) return false;
      if (statusFilter && (r.status ?? "pending") !== statusFilter) return false;
      return true;
    });
  }, [reservations, search, dateFilter, localFilter, statusFilter]);

  const handleStatus = async (id: string, status: BarReservationStatus) => {
    try {
      await update.mutateAsync({ id, values: { status } });
      toast({ title: "Status atualizado" });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await del.mutateAsync(id);
      toast({ title: "Reserva excluída" });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    }
  };

  const exportCsv = () => {
    const headers = ["Nome", "Email", "Telefone", "Pessoas", "Data", "Local", "Status", "Mensagem", "Criada em"];
    const rows = filtered.map((r) => [
      r.name, r.email, r.phone, r.guests,
      format(parseLocalDate(r.date), "dd/MM/yyyy"),
      r.local,
      statusMeta[(r.status ?? "pending") as BarReservationStatus].label,
      r.message ?? "",
      new Date(r.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.map(escapeCsv).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservas-${cfg.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3" />
        <p className="text-sm text-muted-foreground">Carregando reservas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!hideFilters && (
        <div className="flex flex-wrap gap-2 items-end">
          <div className="flex-1 min-w-[200px]">
            <Input placeholder="Buscar por nome, email ou telefone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-auto" />
          <Select value={localFilter || "all"} onValueChange={(v) => setLocalFilter(v === "all" ? "" : v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Local" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os locais</SelectItem>
              {cfg.locais.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
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
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
          <CalendarX className="h-12 w-12 mx-auto text-primary/60 mb-3" />
          <h3 className="font-semibold mb-1">Nenhuma reserva encontrada</h3>
          <p className="text-sm text-muted-foreground">Sem resultados para os filtros aplicados.</p>
        </div>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {showBarLabel && <TableHead>Bar</TableHead>}
                <TableHead>Cliente</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Pessoas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => {
                const status = (r.status ?? "pending") as BarReservationStatus;
                const meta = statusMeta[status];
                return (
                  <TableRow key={r.id}>
                    {showBarLabel && <TableCell><Badge variant="outline">{cfg.shortName}</Badge></TableCell>}
                    <TableCell>
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.phone}</div>
                    </TableCell>
                    <TableCell>{format(parseLocalDate(r.date), "dd/MM/yyyy")}</TableCell>
                    <TableCell><Badge variant="outline">{r.local}</Badge></TableCell>
                    <TableCell>{r.guests}</TableCell>
                    <TableCell>
                      <Select value={status} onValueChange={(v) => handleStatus(r.id, v as BarReservationStatus)}>
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue><Badge variant={meta.variant}>{meta.label}</Badge></SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="confirmed">Confirmada</SelectItem>
                          <SelectItem value="cancelled">Cancelada</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDelete(r)} className="hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="text-sm text-muted-foreground">{filtered.length} reserva(s)</div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Excluir reserva de <strong>{confirmDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDelete) await handleDelete(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
