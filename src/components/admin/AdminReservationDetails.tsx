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
import { useReservationLogs, type Reservation, type ReservationStatus } from "@/hooks/useReservations";

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

  const { data: logs, isLoading: loadingLogs } = useReservationLogs(reservation?.id);

  const formatLogStatus = (status: string | null) => {
    if (!status) return "";
    return statusLabel[status as ReservationStatus] || status;
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
            {r.message && (
              <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-md text-sm">
                <span className="font-semibold block mb-1">Mensagem/Ocasião:</span>
                <span className="whitespace-pre-wrap">{r.message}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <ContactRow icon={<Mail className="h-4 w-4" />} value={r.email} href={`mailto:${r.email}`} onCopy={() => copy(r.email, "Email")} />
            <ContactRow 
              icon={<Phone className="h-4 w-4" />} 
              value={r.phone} 
              href={`tel:${r.phone.replace(/\D/g, "")}`} 
              onCopy={() => copy(r.phone, "Telefone")}
              whatsapp={`https://wa.me/55${r.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Olá ${r.name.split(' ')[0]}, confirmamos sua reserva para o dia ${format(parseLocalDate(r.date), "dd/MM/yyyy")} no período da ${r.periodo === "tarde" ? "Tarde" : "Noite"}.`)}`}
            />
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            Criada em {format(new Date(r.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">Histórico de Alterações</h4>
            {loadingLogs ? (
              <p className="text-xs text-muted-foreground">Carregando histórico...</p>
            ) : logs && logs.length > 0 ? (
              <div className="space-y-2 border-l-2 border-primary/20 pl-4 ml-2">
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    <div className="absolute -left-[21px] top-1 h-2 w-2 rounded-full bg-primary/50" />
                    <div className="text-xs text-muted-foreground mb-1">
                      {format(new Date(log.changed_at), "dd/MM/yyyy HH:mm")}
                    </div>
                    <div className="text-sm">
                      {log.old_status ? (
                        <>Alterado de <strong>{formatLogStatus(log.old_status)}</strong> para <strong>{formatLogStatus(log.new_status)}</strong></>
                      ) : (
                        <>Criada como <strong>{formatLogStatus(log.new_status)}</strong></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">Nenhuma alteração registrada.</p>
            )}
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

const ContactRow = ({ icon, value, href, onCopy, whatsapp }: { icon: React.ReactNode; value: string; href: string; onCopy: () => void; whatsapp?: string }) => (
  <div className="flex items-center gap-2 rounded-md border bg-muted/20 px-3 py-2">
    <a href={href} className="flex-1 flex items-center gap-2 text-sm hover:text-primary truncate">
      {icon}
      <span className="truncate">{value}</span>
    </a>
    <div className="flex items-center gap-1">
      {whatsapp && (
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center h-7 px-2 text-xs font-medium rounded-md bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors">
          WhatsApp
        </a>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onCopy} title="Copiar">
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  </div>
);
