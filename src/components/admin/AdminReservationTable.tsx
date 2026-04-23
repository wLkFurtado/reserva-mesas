import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarX,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { parseLocalDate, todayLocalISO } from "@/lib/date-utils";
import type { Reservation, ReservationStatus } from "@/hooks/useReservations";
import { ExportCsvButton } from "./ExportCsvButton";

const PAGE_SIZE = 10;

const statusMeta: Record<ReservationStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  pending: { label: "Pendente", variant: "secondary" },
  confirmed: { label: "Confirmada", variant: "default" },
  cancelled: { label: "Cancelada", variant: "destructive" },
};

type SortKey = "date" | "name" | "guests" | "periodo" | "status" | "created_at";

interface Props {
  reservations: Reservation[];
  loading: boolean;
  sortKey: string;
  sortDir: "asc" | "desc";
  page: number;
  onSort: (key: string, dir: "asc" | "desc") => void;
  onPage: (page: number) => void;
  onView: (r: Reservation) => void;
  onEdit: (r: Reservation) => void;
  onDelete: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: ReservationStatus) => Promise<void>;
  onBulkStatus: (ids: string[], status: ReservationStatus) => Promise<void>;
  onCreate: () => void;
}

export const AdminReservationTable = ({
  reservations,
  loading,
  sortKey,
  sortDir,
  page,
  onSort,
  onPage,
  onView,
  onEdit,
  onDelete,
  onUpdateStatus,
  onBulkStatus,
  onCreate,
}: Props) => {
  const [confirmDelete, setConfirmDelete] = useState<Reservation | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const sorted = useMemo(() => {
    const arr = [...reservations];
    arr.sort((a, b) => {
      const k = sortKey as SortKey;
      let av: any, bv: any;
      switch (k) {
        case "name": av = a.name.toLowerCase(); bv = b.name.toLowerCase(); break;
        case "guests": av = a.guests; bv = b.guests; break;
        case "periodo": av = a.periodo; bv = b.periodo; break;
        case "status": av = a.status ?? "pending"; bv = b.status ?? "pending"; break;
        case "created_at": av = a.created_at; bv = b.created_at; break;
        default: av = a.date; bv = b.date;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return arr;
  }, [reservations, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * PAGE_SIZE;
  const pageItems = sorted.slice(pageStart, pageStart + PAGE_SIZE);

  const toggleSort = (key: string) => {
    if (sortKey === key) onSort(key, sortDir === "asc" ? "desc" : "asc");
    else onSort(key, "asc");
  };

  const SortIcon = ({ k }: { k: string }) => {
    if (sortKey !== k) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-50" />;
    return sortDir === "asc" ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />;
  };

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((r) => selected.has(r.id));
  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) pageItems.forEach((r) => next.delete(r.id));
    else pageItems.forEach((r) => next.add(r.id));
    setSelected(next);
  };
  const toggleOne = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };
  const selectedReservations = useMemo(
    () => reservations.filter((r) => selected.has(r.id)),
    [reservations, selected]
  );

  const today = todayLocalISO();

  const periodoBadge = (p: string) => {
    if (p === "tarde") return <Badge className="bg-accent/20 text-accent border-accent/30 hover:bg-accent/30">Tarde</Badge>;
    if (p === "noite") return <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30">Noite</Badge>;
    return <Badge variant="outline">{p}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground text-sm">Carregando reservas...</p>
      </div>
    );
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-muted/30 rounded-lg p-10 border border-dashed border-border">
          <CalendarX className="h-12 w-12 mx-auto text-primary/60 mb-4" />
          <h3 className="text-lg font-semibold mb-1">Nenhuma reserva encontrada</h3>
          <p className="text-muted-foreground text-sm mb-5">
            Tente ajustar os filtros ou criar uma nova reserva.
          </p>
          <Button onClick={onCreate} className="bg-primary hover:bg-primary/90">
            Nova reserva
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selecionada(s)</span>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => onBulkStatus(Array.from(selected), "confirmed").then(() => setSelected(new Set()))}>
              Confirmar todas
            </Button>
            <Button size="sm" variant="outline" onClick={() => onBulkStatus(Array.from(selected), "cancelled").then(() => setSelected(new Set()))}>
              Cancelar todas
            </Button>
            <ExportCsvButton reservations={selectedReservations} filename="reservas-selecionadas.csv" />
            <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Limpar</Button>
          </div>
        </div>
      )}

      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAllOnPage} aria-label="Selecionar todas" />
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("name")} className="flex items-center font-medium">
                  Cliente <SortIcon k="name" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("date")} className="flex items-center font-medium">
                  Data <SortIcon k="date" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("periodo")} className="flex items-center font-medium">
                  Período <SortIcon k="periodo" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("guests")} className="flex items-center font-medium">
                  Pessoas <SortIcon k="guests" />
                </button>
              </TableHead>
              <TableHead>
                <button onClick={() => toggleSort("status")} className="flex items-center font-medium">
                  Status <SortIcon k="status" />
                </button>
              </TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((r) => {
              const status = (r.status ?? "pending") as ReservationStatus;
              const meta = statusMeta[status];
              const isToday = r.date === today;
              return (
                <TableRow
                  key={r.id}
                  className={cn(isToday && "border-l-2 border-l-primary")}
                  data-state={selected.has(r.id) ? "selected" : undefined}
                >
                  <TableCell>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleOne(r.id)}
                      aria-label="Selecionar reserva"
                    />
                  </TableCell>
                  <TableCell>
                    <button onClick={() => onView(r)} className="text-left hover:text-primary transition-colors">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                      <div className="text-xs text-muted-foreground">{r.phone}</div>
                    </button>
                  </TableCell>
                  <TableCell className={cn(isToday && "font-medium text-primary")}>
                    {format(parseLocalDate(r.date), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>{periodoBadge(r.periodo)}</TableCell>
                  <TableCell>{r.guests}</TableCell>
                  <TableCell>
                    <Select value={status} onValueChange={(v) => onUpdateStatus(r.id, v as ReservationStatus)}>
                      <SelectTrigger className="h-8 w-[140px]">
                        <SelectValue>
                          <Badge variant={meta.variant}>{meta.label}</Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="confirmed">Confirmada</SelectItem>
                        <SelectItem value="cancelled">Cancelada</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onView(r)} title="Detalhes">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(r)} title="Editar">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setConfirmDelete(r)}
                        className="hover:text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="text-sm text-muted-foreground">
          Página {currentPage} de {totalPages} · {sorted.length} reserva(s)
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => onPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => onPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}>
            Próxima <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir reserva</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a reserva de <strong>{confirmDelete?.name}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (confirmDelete) await onDelete(confirmDelete.id);
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
