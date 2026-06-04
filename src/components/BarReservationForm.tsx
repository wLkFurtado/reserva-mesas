import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { CalendarDays, MapPin, Users, Phone, Mail, User, MessageSquare } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { maskPhone } from "@/lib/phone-mask";
import { BARS, type BarId } from "@/lib/bars";
import { useCreateBarReservation } from "@/hooks/useBarReservations";

const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

const schema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(120),
  email: z.string().trim().email("Email inválido").max(180),
  phone: z.string().trim().regex(phoneRegex, "Telefone (XX) XXXXX-XXXX"),
  guests: z.number().int().min(1).max(50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  local: z.string().min(1, "Selecione o local"),
  message: z.string().trim().max(500).optional(),
});
type FormValues = z.infer<typeof schema>;

interface Props {
  bar: BarId;
}

const BarReservationForm = ({ bar }: Props) => {
  const cfg = BARS[bar];
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const create = useCreateBarReservation(bar);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", guests: 2, date: "", local: cfg.locais.length === 1 ? cfg.locais[0] : "", message: "" },
  });

  const phone = watch("phone");
  const guests = watch("guests");
  const local = watch("local");

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      if (values.guests > 6) {
        window.open("https://ig.me/m/troiacabofrio?ref=w43934699", "_blank");
        toast({
          title: "Grupo grande",
          description: "Para grupos acima de 6, redirecionamos ao Instagram para atendimento personalizado.",
        });
        return;
      }
      const payload = { ...values };
      if (!payload.message?.trim()) delete (payload as any).message;
      await create.mutateAsync(payload as any);
      const params = new URLSearchParams({
        name: values.name,
        date: values.date,
        periodo: values.local,
        guests: values.guests.toString(),
      });
      navigate(`/obrigado?${params.toString()}`);
      toast({ title: "Reserva enviada!", description: "Em breve confirmaremos seu pedido." });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao enviar", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-elegant border-border/50 backdrop-blur-sm shadow-elegant">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Reserva — {cfg.shortName}
        </CardTitle>
        <p className="text-muted-foreground">{cfg.name}</p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2"><User className="w-4 h-4 text-primary" />Nome Completo</Label>
            <Input id="name" placeholder="Seu nome" {...register("name")} className="bg-input border-border/30" />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2"><Mail className="w-4 h-4 text-primary" />Email</Label>
            <Input id="email" type="email" placeholder="seu@email.com" {...register("email")} className="bg-input border-border/30" />
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="w-4 h-4 text-primary" />Telefone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setValue("phone", maskPhone(e.target.value), { shouldValidate: true })}
              placeholder="(XX) XXXXX-XXXX"
              maxLength={16}
              className="bg-input border-border/30"
            />
            {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" />Número de Pessoas</Label>
            <Select value={guests?.toString() ?? "2"} onValueChange={(v) => setValue("guests", parseInt(v), { shouldValidate: true })}>
              <SelectTrigger className="bg-input border-border/30"><SelectValue /></SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={n.toString()}>{n} {n === 1 ? "pessoa" : "pessoas"}</SelectItem>
                ))}
                <SelectItem value="25">Mais de 20 pessoas</SelectItem>
              </SelectContent>
            </Select>
            {guests > 6 && (
              <p className="text-sm text-primary">Para grupos acima de 6, você será redirecionado ao Instagram.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2"><CalendarDays className="w-4 h-4 text-primary" />Data</Label>
            <Input id="date" type="date" min={today} {...register("date")} className="bg-input border-border/30" />
            {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" />Local</Label>
            <Select value={local} onValueChange={(v) => setValue("local", v, { shouldValidate: true })}>
              <SelectTrigger className="bg-input border-border/30"><SelectValue placeholder="Selecione o local" /></SelectTrigger>
              <SelectContent>
                {cfg.locais.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.local && <p className="text-sm text-destructive">{errors.local.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" />Mensagem (Opcional)</Label>
            <Textarea id="message" rows={3} placeholder="Ocasião, restrição alimentar, pedido especial..." {...register("message")} className="bg-input border-border/30 resize-none" />
          </div>

          <Button type="submit" disabled={submitting} className="w-full bg-gradient-gold hover:shadow-gold-glow text-dark-primary font-semibold py-3 text-lg">
            {submitting ? "Enviando..." : "Fazer Reserva"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BarReservationForm;
