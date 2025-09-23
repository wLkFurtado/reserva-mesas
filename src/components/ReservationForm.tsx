import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Clock, Users, Phone, Mail, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ReservationData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: string;
}

// Type for the reservation status function return
interface ReservationStatus {
  reservation_date: string;
  reservations_count: number;
  seats_booked: number;
  seats_remaining: number;
  capacity: number;
}

// Integração com Supabase substitui o armazenamento em memória
const ReservationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ReservationData>({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    date: "",
    periodo: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [status, setStatus] = useState<{ seatsBooked: number; seatsRemaining: number; capacity: number } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 1 : value
    }));
  };

  const handleGuestsChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      guests: parseInt(value)
    }));
  };

  useEffect(() => {
    if (!formData.date) { setStatus(null); return; }
    const fetchStatus = async () => {
      setStatusLoading(true);
      try {
        // @ts-ignore - Using RPC function not in generated types
        const result = await supabase.rpc('get_reservations_status', { target_date: formData.date });
        const { data, error } = result;
        
        if (error) {
          console.error('Erro ao buscar status de reservas', error);
          setStatus(null);
        } else if (data && (data as any[]).length > 0) {
          const row = (data as any[])[0];
          setStatus({
            seatsBooked: row.seats_booked ?? 0,
            seatsRemaining: row.seats_remaining ?? 110,
            capacity: row.capacity ?? 110,
          });
        } else {
          setStatus({ seatsBooked: 0, seatsRemaining: 110, capacity: 110 });
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar status', err);
        setStatus(null);
      }
      setStatusLoading(false);
    };
    fetchStatus();
  }, [formData.date]);

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.email.trim()) {
      toast({ title: "Email é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.phone.trim()) {
      toast({ title: "Telefone é obrigatório", variant: "destructive" });
      return false;
    }
    if (!formData.date) {
      toast({ title: "Data é obrigatória", variant: "destructive" });
      return false;
    }
    if (!formData.periodo) {
      toast({ title: "Período é obrigatório", variant: "destructive" });
      return false;
    }
    if (formData.guests < 1) {
      toast({ title: "Número de pessoas deve ser maior que 0", variant: "destructive" });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Se for mais de 6 pessoas, redirecionar para Instagram
      if (formData.guests > 6) {
        window.open("https://ig.me/m/troiacabofrio?ref=w43934699", "_blank");
        toast({
          title: "Reserva para grupo especial",
          description: "Para reservas acima de 6 pessoas, você foi direcionado ao nosso Instagram Direct para atendimento personalizado.",
        });
        return;
      }

      // Verificar capacidade antes de inserir
      try {
        // @ts-ignore - Using RPC function not in generated types
        const result = await supabase.rpc('get_reservations_status', { target_date: formData.date });
        const { data: statusData, error: statusError } = result;
        
        if (statusError) {
          console.error("Erro ao verificar capacidade", statusError);
        }
        const row = statusData && (statusData as any[]).length > 0 ? (statusData as any[])[0] : null;
        const seatsRemainingCheck = row?.seats_remaining ?? 110;

      if (seatsRemainingCheck <= 0) {
        toast({
          title: "Sem lugares disponíveis",
          description: "Este dia atingiu a capacidade máxima de 110 lugares. Por favor, escolha outra data.",
          variant: "destructive"
        });
        return;
      }
      if (formData.guests > seatsRemainingCheck) {
        toast({
          title: "Lugares insuficientes",
          description: `Restam apenas ${seatsRemainingCheck} lugares nesta data.`,
          variant: "destructive"
        });
        return;
      }
      } catch (statusErr) {
        console.error("Erro inesperado ao verificar capacidade", statusErr);
        // Continue with the reservation as fallback
      }

      // Inserir reserva no Supabase
      const { error: insertError } = await supabase
        .from("reservations")
        .insert({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          guests: formData.guests,
          date: formData.date,
          periodo: formData.periodo,
        });

      if (insertError) {
        const msg = insertError.message || "Erro ao salvar.";
        if (msg.toLowerCase().includes("capacidade diária") || insertError.code === "23514") {
          toast({
            title: "Sem lugares disponíveis",
            description: "Outro cliente reservou nesse meio tempo e a capacidade foi atingida.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Erro ao enviar reserva",
            description: "Tente novamente em alguns minutos.",
            variant: "destructive"
          });
        }
        return;
      }

      // Redirecionar para página de agradecimento com os dados da reserva
      const searchParams = new URLSearchParams({
        name: formData.name,
        date: formData.date,
        periodo: formData.periodo,
        guests: formData.guests.toString()
      });
      
      navigate(`/obrigado?${searchParams.toString()}`);
      
      toast({
        title: "Reserva enviada com sucesso!",
        description: "Redirecionando para confirmação...",
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];
  const seatsBooked = status?.seatsBooked ?? 0;
  const seatsRemaining = status?.seatsRemaining ?? 110;

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
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Nome */}
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2 text-foreground">
              <User className="w-4 h-4 text-primary" />
              Nome Completo
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Digite seu nome completo"
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu.email@exemplo.com"
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Telefone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
              <Phone className="w-4 h-4 text-primary" />
              Telefone
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="(XX) XXXXX-XXXX"
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Número de pessoas */}
          <div className="space-y-2">
            <Label htmlFor="guests" className="flex items-center gap-2 text-foreground">
              <Users className="w-4 h-4 text-primary" />
              Número de Pessoas
            </Label>
            <Select value={formData.guests.toString()} onValueChange={handleGuestsChange}>
              <SelectTrigger className="bg-input border-border/30 focus:border-primary/50 transition-colors">
                <SelectValue placeholder="Selecione o número de pessoas" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'pessoa' : 'pessoas'}
                  </SelectItem>
                ))}
                <SelectItem value="25">
                  Mais de 20 pessoas
                </SelectItem>
              </SelectContent>
            </Select>
            {formData.guests > 6 && (
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
              name="date"
              type="date"
              min={today}
              value={formData.date}
              onChange={handleInputChange}
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
            {formData.date && (
              <>
                {statusLoading ? (
                  <p className="text-sm text-muted-foreground">Carregando disponibilidade...</p>
                ) : status ? (
                  <p className="text-sm text-muted-foreground">
                    Lugares reservados: {seatsBooked}/{status.capacity} • Restantes: {seatsRemaining}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Disponibilidade: 110 lugares</p>
                )}
                {status && seatsRemaining === 0 && (
                  <p className="text-sm text-primary">Não há lugares disponíveis nesta data.</p>
                )}
              </>
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
              name="periodo"
              value={formData.periodo}
              onChange={handleInputChange}
              className="flex h-10 w-full rounded-md border border-border/30 bg-input px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus:border-primary/50 transition-colors"
            >
              <option value="">Selecione o período</option>
              <option value="tarde">Tarde - 13:00</option>
              <option value="noite">Noite - 19:00</option>
            </select>
          </div>

          {/* Botão de Envio */}
          <Button 
            type="submit" 
            disabled={isSubmitting}
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