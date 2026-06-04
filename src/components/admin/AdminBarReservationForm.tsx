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
import { useCreateBarReservation, type BarReservationStatus } from "@/hooks/useBarReservations";
import { toast } from "@/hooks/use-toast";

interface Props {
  bar: BarId;
  open: boolean;
  onClose: () => void;
}

export const AdminBarReservationForm = ({ bar, open, onClose }: Props) => {
  const cfg = BARS[bar];
  const create = useCreateBarReservation(bar);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 2,
    date: new Date().toISOString().slice(0, 10),
    local: cfg.locais[0],
    status: "confirmed" as BarReservationStatus,
    message: "",
  });

  useEffect(() => {
    if (open) {
      setForm((f) => ({ ...f, local: cfg.locais[0] }));
    }
  }, [open, cfg]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await create.mutateAsync({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        guests: Number(form.guests) || 1,
        date: form.date,
        local: form.local,
        status: form.status,
        message: form.message.trim() || null,
      });
      toast({ title: "Reserva criada" });
      onClose();
      setForm({
        name: "", email: "", phone: "", guests: 2,
        date: new Date().toISOString().slice(0, 10),
        local: cfg.locais[0], status: "confirmed", message: "",
      });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao salvar", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova reserva — {cfg.shortName}</DialogTitle>
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
            <Button type="submit" disabled={create.isPending}>{create.isPending ? "Salvando..." : "Criar reserva"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
