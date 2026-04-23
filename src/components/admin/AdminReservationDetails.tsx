import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Copy, Edit, Mail, Phone, Trash2, Users, CalendarDays, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { parseLocalDate } from "@/lib/date-utils";
import { toast } from "@/hooks/use-toast";
import type { Reservation, ReservationStatus } from "@/hooks/useReservations";

const statusLabel: Record<ReservationStatus, string> = {
  pending: "Pendente",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

interface Props {
  reservation: Reservation | null;
  onClose: () => void;
  onEdit: (r: Reservation) => void;
  onDelete: (id: string) => void;
}

export const AdminReservationDetails = ({ reservation, onClose, onEdit, onDelete }: Props) => {
  if (!reservation) return null;
  const r = reservation;
  const status = (r.status ?? "pending") as ReservationStatus;

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copiado` });
  };

  const copyAll = () => {
    const text = `${r.name}\n${r.email}\n${r.phone}\n${format(parseLocalDate(r.date), "dd/MM/yyyy")} · ${r.periodo === "tarde" ? "Tarde" : "Noite"}\n${r.guests} pessoa(s)`;
    navigator.clipboard.writeText(text);
    toast({ title: "Contato copiado" });
  };

  return (
    <Sheet open={!!reservation} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{r.name}</SheetTitle>
          <SheetDescription>
            <Badge variant={status === "confirmed" ? "default" : status === "cancelled" ? "destructive" : "secondary"}>
              {statusLabel[status]}
            </Badge>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div className="space-y-3">
            <DetailRow icon={<CalendarDays className="h-4 w-4 text-primary" />} label="Data">
              {format(parseLocalDate(r.date), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DetailRow>
            <DetailRow icon={<Clock className="h-4 w-4 text-primary" />} label="Período">
              {r.periodo === "tarde" ? "Tarde" : "Noite"}
            </DetailRow>
            <DetailRow icon={<Users className="h-4 w-4 text-primary" />} label="Pessoas">
              {r.guests}
            </DetailRow>
          </div>

          <Separator />

          <div className="space-y-3">
            <ContactRow icon={<Mail className="h-4 w-4" />} value={r.email} href={`mailto:${r.email}`} onCopy={() => copy(r.email, "Email")} />
            <ContactRow icon={<Phone className="h-4 w-4" />} value={r.phone} href={`tel:${r.phone.replace(/\D/g, "")}`} onCopy={() => copy(r.phone, "Telefone")} />
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            Criada em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={copyAll} className="gap-2">
              <Copy className="h-4 w-4" /> Copiar
            </Button>
            <Button variant="outline" onClick={() => { onEdit(r); onClose(); }} className="gap-2">
              <Edit className="h-4 w-4" /> Editar
            </Button>
            <Button
              variant="outline"
              onClick={() => { onDelete(r.id); onClose(); }}
              className="col-span-2 gap-2 hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4" /> Excluir reserva
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const DetailRow = ({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-sm font-medium capitalize">{children}</div>
    </div>
  </div>
);

const ContactRow = ({ icon, value, href, onCopy }: { icon: React.ReactNode; value: string; href: string; onCopy: () => void }) => (
  <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/20 px-3 py-2">
    <a href={href} className="flex items-center gap-2 text-sm hover:text-primary truncate">
      {icon}
      <span className="truncate">{value}</span>
    </a>
    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy} title="Copiar">
      <Copy className="h-3.5 w-3.5" />
    </Button>
  </div>
);
