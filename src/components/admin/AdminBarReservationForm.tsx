import { useEffect, useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
import { AlertTriangle } from "lucide-react";
import { BARS, type BarId } from "@/lib/bars";
import {
  useCreateBarReservation,
  useUpdateBarReservation,
  useBarDayBooked,
  type BarReservation,
  type BarReservationStatus,
} from "@/hooks/useBarReservations";
import { toast } from "@/hooks/use-toast";
import { ImageUploadField } from "./ImageUploadField";

interface Props {
  bar: BarId;
  open: boolean;
  onClose: () => void;
  editing?: BarReservation | null;
}

export const AdminBarReservationForm = ({ bar, open, onClose, editing }: Props) => {
  const cfg = BARS[bar];
  const create = useCreateBarReservation(bar);
  const update = useUpdateBarReservation(bar);
  const isEdit = !!editing;

  const emptyForm = () => ({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: new Date().toISOString().slice(0, 10),
    local: cfg.locais[0],
    status: "confirmed" as BarReservationStatus,
    message: "",
    image_url: null as string | null,
  });

  const [form, setForm] = useState(emptyForm());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [capacityInfo, setCapacityInfo] = useState<{ booked: number; cap: number; adding: number } | null>(null);

  const { data: booked = 0 } = useBarDayBooked(bar, form.date);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        name: editing.name,
        email: editing.email,
        phone: editing.phone,
        guests: editing.guests,
        date: editing.date,
        local: editing.local,
        status: (editing.status ?? "confirmed") as BarReservationStatus,
        message: editing.message ?? "",
        image_url: editing.image_url ?? null,
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editing, cfg]);

  const persist = async () => {
    try {
      const values = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        guests: Number(form.guests) || 1,
        date: form.date,
        local: form.local,
        status: form.status,
        message: form.message.trim() || null,
        image_url: form.image_url ?? null,
      };
      if (isEdit && editing) {
        await update.mutateAsync({ id: editing.id, values });
        toast({ title: "Reserva atualizada" });
      } else {
        await create.mutateAsync(values);
        toast({ title: "Reserva criada" });
      }
      setConfirmOpen(false);
      onClose();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao salvar", variant: "destructive" });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.status !== "cancelled") {
      const alreadyCounted = editing && editing.date === form.date && editing.status !== "cancelled"
        ? editing.guests
        : 0;
      const adding = Number(form.guests) || 0;
      const projected = booked - alreadyCounted + adding;
      if (projected > cfg.capacity) {
        setCapacityInfo({ booked: booked - alreadyCounted, cap: cfg.capacity, adding });
        setConfirmOpen(true);
        return;
      }
    }
    await persist();
  };

  const pending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Editar reserva" : "Nova reserva"} — {cfg.shortName}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <Label>Nome</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Email</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Pessoas</Label>
              <Input type="number" min={1} required value={form.guests} onChange={(e) => setForm({ ...form, guests: Number(e.target.value) })} />
            </div>
            <div className="col-span-2">
              <Label>Data</Label>
              <Input type="date" required value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Local</Label>
            <Select value={form.local} onValueChange={(v) => setForm({ ...form, local: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {cfg.locais.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as BarReservationStatus })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="confirmed">Confirmada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observação</Label>
            <Textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
          </div>
          <ImageUploadField
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
            folder={`reservas/${bar}`}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Capacidade do dia excedida
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  O dia <strong>{form.date}</strong> em <strong>{cfg.shortName}</strong> já está com capacidade máxima.
                </p>
                {capacityInfo && (
                  <div className="rounded-md bg-muted p-3 text-foreground">
                    <div>Já reservados: <strong>{capacityInfo.booked}</strong></div>
                    <div>Tentando adicionar: <strong>{capacityInfo.adding}</strong></div>
                    <div>Capacidade do dia: <strong>{capacityInfo.cap}</strong></div>
                    <div className="mt-1 text-destructive">
                      Excesso: <strong>{capacityInfo.booked + capacityInfo.adding - capacityInfo.cap}</strong> lugares
                    </div>
                  </div>
                )}
                <p>Deseja realmente criar esta reserva mesmo ultrapassando o limite?</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={persist}
              disabled={pending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Confirmar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};
