import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { parseLocalDate, toLocalISO } from "@/lib/date-utils";
import { maskPhone } from "@/lib/phone-mask";
import { reservationAdminSchema } from "@/lib/validation";
import { toast } from "@/hooks/use-toast";
import type { Reservation, ReservationStatus } from "@/hooks/useReservations";

interface FormState {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: string;
  status: ReservationStatus;
}

const empty: FormState = {
  name: "",
  email: "",
  phone: "",
  guests: 1,
  date: "",
  periodo: "tarde",
  status: "pending",
};

interface Props {
  open: boolean;
  editing: Reservation | null;
  onClose: () => void;
  onSubmit: (values: FormState, editingId?: string) => Promise<void>;
}

export const AdminReservationForm = ({ open, editing, onClose, onSubmit }: Props) => {
  const [data, setData] = useState<FormState>(empty);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editing) {
      setData({
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        guests: editing.guests,
        date: editing.date,
        periodo: editing.periodo,
        status: (editing.status ?? "pending") as ReservationStatus,
      });
    } else {
      setData(empty);
    }
  }, [editing, open]);

  const dateObj = data.date ? parseLocalDate(data.date) : undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleSave = async () => {
    const result = reservationAdminSchema.safeParse(data);
    if (!result.success) {
      toast({ title: result.error.issues[0]?.message ?? "Dados inválidos", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(data, editing?.id);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Editar Reserva" : "Nova Reserva"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Nome completo</Label>
            <Input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="email@exemplo.com" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={data.phone} onChange={(e) => setData({ ...data, phone: maskPhone(e.target.value) })} placeholder="(XX) XXXXX-XXXX" maxLength={16} />
          </div>
          <div>
            <Label>Pessoas</Label>
            <Input type="number" min={1} max={110} value={data.guests} onChange={(e) => setData({ ...data, guests: parseInt(e.target.value) || 1 })} />
          </div>
          <div>
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal mt-1", !dateObj && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateObj ? format(dateObj, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={dateObj}
                  onSelect={(d) => setData({ ...data, date: d ? toLocalISO(d) : "" })}
                  disabled={(d) => d < today}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label>Período</Label>
            <Select value={data.periodo} onValueChange={(v) => setData({ ...data, periodo: v })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="tarde">Tarde</SelectItem>
                <SelectItem value="noite">Noite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Label>Status</Label>
            <Select value={data.status} onValueChange={(v) => setData({ ...data, status: v as ReservationStatus })}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Cancelar</Button>
          <Button onClick={handleSave} disabled={submitting} className="bg-primary hover:bg-primary/90">
            {editing ? "Atualizar" : "Criar"} Reserva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
