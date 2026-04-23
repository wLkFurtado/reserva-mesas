import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, ChevronDown, RefreshCw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { parseLocalDate, toLocalISO, formatDateToDisplay } from "@/lib/date-utils";
import { useAdminFilters } from "@/hooks/useAdminFilters";

interface Props {
  filters: ReturnType<typeof useAdminFilters>;
  onRefresh: () => void;
  resultCount: number;
  totalCount: number;
}

export const AdminFilters = ({ filters, onRefresh, resultCount, totalCount }: Props) => {
  const { state, update, reset, setQuickDate, dateLabel } = filters;
  const [open, setOpen] = useState(true);

  const dateObj = state.dateMode === "exact" && state.date ? parseLocalDate(state.date) : undefined;
  const hasFilters = !!(state.search || state.date || state.periodo || state.guests || state.status);

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="bg-muted/30 rounded-lg border">
      <div className="flex items-center justify-between p-3 gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Nome, email ou telefone..."
            value={state.search}
            onChange={(e) => update({ search: e.target.value })}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="icon" onClick={onRefresh} title="Atualizar">
          <RefreshCw className="h-4 w-4" />
        </Button>
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1">
            Filtros
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="px-3 pb-3 space-y-4">
        <div>
          <Label className="text-xs font-medium text-muted-foreground">Atalhos</Label>
          <div className="flex flex-wrap gap-2 mt-1.5">
            <Button variant="outline" size="sm" onClick={() => setQuickDate("today")} className="text-xs">Hoje</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate("tomorrow")} className="text-xs">Amanhã</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate("thisWeek")} className="text-xs">Esta semana</Button>
            <Button variant="outline" size="sm" onClick={() => setQuickDate("next7Days")} className="text-xs">Próximos 7 dias</Button>
            <Button variant="ghost" size="sm" onClick={() => setQuickDate("all")} className="text-xs">Todas as datas</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <Label className="text-xs font-medium text-muted-foreground">Data específica</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal mt-1.5",
                    !dateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateObj ? format(dateObj, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateObj}
                  onSelect={(date) => {
                    if (date) update({ date: toLocalISO(date), dateMode: "exact" });
                    else update({ date: "", dateMode: "" });
                  }}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Período</Label>
            <Select value={state.periodo || "all"} onValueChange={(v) => update({ periodo: v === "all" ? "" : v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noite">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Pessoas</Label>
            <Select value={state.guests || "all"} onValueChange={(v) => update({ guests: v === "all" ? "" : v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Qualquer</SelectItem>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n} pessoa{n > 1 ? "s" : ""}</SelectItem>
                ))}
                <SelectItem value="6">6+ pessoas</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs font-medium text-muted-foreground">Status</Label>
            <Select value={state.status || "all"} onValueChange={(v) => update({ status: v === "all" ? "" : v })}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-muted-foreground">
              {resultCount} de {totalCount} reserva(s)
            </span>
            {state.search && <Badge variant="secondary">Busca: "{state.search}"</Badge>}
            {dateLabel && <Badge variant="secondary">Data: {dateLabel}</Badge>}
            {state.periodo && <Badge variant="secondary">Período: {state.periodo === "tarde" ? "Tarde" : "Noite"}</Badge>}
            {state.guests && <Badge variant="secondary">Pessoas: {state.guests === "6" ? "6+" : state.guests}</Badge>}
            {state.status && <Badge variant="secondary">Status: {state.status}</Badge>}
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs gap-1">
              <X className="h-3 w-3" /> Limpar tudo
            </Button>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
