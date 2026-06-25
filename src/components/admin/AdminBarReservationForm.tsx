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
import { BARS, type BarId } from "@/lib/bars";
import {
  useCreateBarReservation,
  useUpdateBarReservation,
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
      });
    } else {
      setForm(emptyForm());
    }
  }, [open, editing, cfg]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      };
      if (isEdit && editing) {
        await update.mutateAsync({ id: editing.id, values });
        toast({ title: "Reserva atualizada" });
      } else {
        await create.mutateAsync(values);
        toast({ title: "Reserva criada" });
      }
      onClose();
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao salvar", variant: "destructive" });
    }
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : isEdit ? "Salvar alterações" : "Criar reserva"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
