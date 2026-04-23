import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, Users, Phone, Mail, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { maskPhone } from "@/lib/phone-mask";
import { reservationSchema, type ReservationFormValues } from "@/lib/validation";
import { useReservationStatus } from "@/hooks/useReservations";

const ReservationForm = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      guests: 1,
      date: "",
      periodo: undefined as any,
    },
  });

  const date = watch("date");
  const guests = watch("guests");
  const phone = watch("phone");
  const periodo = watch("periodo");

  const { data: status, isFetching: statusLoading } = useReservationStatus(date);

  const onSubmit = async (values: ReservationFormValues) => {
    setIsSubmitting(true);
    try {
      // Grupo grande -> Instagram
      if (values.guests > 6) {
        window.open("https://ig.me/m/troiacabofrio?ref=w43934699", "_blank");
        toast({
          title: "Reserva para grupo especial",
          description:
            "Para reservas acima de 6 pessoas, você foi direcionado ao nosso Instagram Direct para atendimento personalizado.",
        });
        return;
      }

      // Verificação extra de capacidade
      // @ts-ignore
      const { data: statusData } = await supabase.rpc("get_reservations_status", {
        target_date: values.date,
      });
      const row = (statusData as any[])?.[0];
      const seatsRemainingCheck = row?.seats_remaining ?? 110;

      if (seatsRemainingCheck <= 0) {
        toast({
          title: "Sem lugares disponíveis",
          description:
            "Este dia atingiu a capacidade máxima de 110 lugares. Por favor, escolha outra data.",
          variant: "destructive",
        });
        return;
      }
      if (values.guests > seatsRemainingCheck) {
        toast({
          title: "Lugares insuficientes",
          description: `Restam apenas ${seatsRemainingCheck} lugares nesta data.`,
          variant: "destructive",
        });
        return;
      }

      const { error: insertError } = await supabase
        .from("reservations")
        .insert([values]);

      if (insertError) {
        const msg = insertError.message || "Erro ao salvar.";
        if (
          msg.toLowerCase().includes("capacidade diária") ||
          insertError.code === "23514"
        ) {
          toast({
            title: "Sem lugares disponíveis",
            description:
              "Outro cliente reservou nesse meio tempo e a capacidade foi atingida.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro ao enviar reserva",
            description: "Tente novamente em alguns minutos.",
            variant: "destructive",
          });
        }
        return;
      }

      const params = new URLSearchParams({
        name: values.name,
        date: values.date,
        periodo: values.periodo,
        guests: values.guests.toString(),
      });
      navigate(`/obrigado?${params.toString()}`);
      toast({
        title: "Reserva enviada com sucesso!",
        description: "Redirecionando para confirmação...",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const seatsBooked = status?.seatsBooked ?? 0;
  const seatsRemaining = status?.seatsRemaining ?? 110;
  const dayFull = !!status && seatsRemaining === 0;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-gradient-elegant border-border/50 backdrop-blur-sm shadow-elegant">
      <CardHeader className="text-center space-y-4">
        <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
          Reserva de Mesa
        </CardTitle>
        <p className="text-muted-foreground">
          Reserve sua mesa no Tróia e desfrute de uma experiência gastronômica única
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Nome Completo
            </Label>
            <Input
              id="name"
              placeholder="Digite seu nome completo"
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu.email@exemplo.com"
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              Telefone
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                setValue("phone", maskPhone(e.target.value), { shouldValidate: true })
              }
              placeholder="(XX) XXXXX-XXXX"
              maxLength={16}
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Pessoas */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Número de Pessoas
            </Label>
            <Select
              value={guests?.toString() ?? "1"}
              onValueChange={(v) =>
                setValue("guests", parseInt(v), { shouldValidate: true })
              }
            >
              <SelectTrigger className="bg-input border-border/30 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="Selecione o número de pessoas" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((n) => (
                  <SelectItem key={n} value={n.toString()}>
                    {n} {n === 1 ? "pessoa" : "pessoas"}
                  </SelectItem>
                ))}
                <SelectItem value="25">Mais de 20 pessoas</SelectItem>
              </SelectContent>
            </Select>
            {guests > 6 && (
              <p className="text-sm text-primary">
                ⚠️ Para grupos acima de 6 pessoas, você será direcionado ao nosso Instagram para atendimento personalizado.
              </p>
            )}
          </div>

          {/* Data */}
          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2 text-foreground">
              <CalendarDays className="w-4 h-4 text-primary" />
              Data da Reserva
            </Label>
            <Input
              id="date"
              type="date"
              min={today}
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
            {date && (
              <div className="space-y-1">
                {statusLoading ? (
                  <Skeleton className="h-4 w-56" />
                ) : status ? (
                  <p className="text-sm text-muted-foreground">
                    Lugares reservados: {seatsBooked}/{status.capacity} • Restantes:{" "}
                    <span className={dayFull ? "text-destructive font-medium" : ""}>
                      {seatsRemaining}
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Disponibilidade: 110 lugares
                  </p>
                )}
                {dayFull && (
                  <p className="text-sm text-primary">
                    Não há lugares disponíveis nesta data.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Período */}
          <div className="space-y-2">
            <Label htmlFor="periodo" className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Período
            </Label>
            <select
              id="periodo"
              value={periodo ?? ""}
              onChange={(e) =>
                setValue("periodo", e.target.value as ReservationFormValues["periodo"], {
                  shouldValidate: true,
                })
              }
              className="flex h-10 w-full rounded-md border border-border/30 bg-input px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary/50 transition-colors"
            >
              <option value="">Selecione o período</option>
              <option value="tarde">Tarde - 13:00</option>
              <option value="noite">Noite - 19:00</option>
            </select>
            {errors.periodo && (
              <p className="text-sm text-destructive">{errors.periodo.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting || dayFull}
            className="w-full bg-gradient-gold hover:shadow-gold-glow transition-all duration-300 text-dark-primary font-semibold py-3 text-lg"
          >
            {isSubmitting ? "Enviando..." : "Fazer Reserva"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ReservationForm;
