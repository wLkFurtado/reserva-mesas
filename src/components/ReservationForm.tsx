import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Clock, Users, Phone, Mail, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ReservationData {
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  time: string;
}

// Simulação de banco de dados em memória para contar reservas
const reservationsPerDay = new Map<string, number>();

const ReservationForm = () => {
  const [formData, setFormData] = useState<ReservationData>({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    date: "",
    time: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "guests" ? parseInt(value) || 1 : value
    }));
  };

  const getReservationsCount = (date: string): number => {
    return reservationsPerDay.get(date) || 0;
  };

  const addReservation = (date: string): void => {
    const current = reservationsPerDay.get(date) || 0;
    reservationsPerDay.set(date, current + 1);
  };

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
    if (!formData.time) {
      toast({ title: "Horário é obrigatório", variant: "destructive" });
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
      // Verificar se a data já atingiu o limite
      const currentCount = getReservationsCount(formData.date);
      
      if (currentCount >= 110) {
        toast({
          title: "Data indisponível",
          description: "Este dia já atingiu o limite de 110 reservas. Por favor, escolha outra data.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Se for mais de 6 pessoas, redirecionar para Instagram
      if (formData.guests > 6) {
        window.open("https://ig.me/m/troiacabofrio?ref=w43934699", "_blank");
        toast({
          title: "Reserva para grupo especial",
          description: "Para reservas acima de 6 pessoas, você foi direcionado ao nosso Instagram Direct para atendimento personalizado.",
        });
        setIsSubmitting(false);
        return;
      }

      // Simular envio da reserva
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Adicionar reserva ao contador
      addReservation(formData.date);
      
      toast({
        title: "Reserva enviada com sucesso!",
        description: "Sua reserva foi registrada. Em breve entraremos em contato para confirmar.",
      });

      // Limpar formulário
      setFormData({
        name: "",
        email: "",
        phone: "",
        guests: 1,
        date: "",
        time: ""
      });

    } catch (error) {
      toast({
        title: "Erro ao enviar reserva",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular data mínima (hoje)
  const today = new Date().toISOString().split('T')[0];
  const currentReservations = formData.date ? getReservationsCount(formData.date) : 0;

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
            <Input
              id="guests"
              name="guests"
              type="number"
              min="1"
              max="20"
              value={formData.guests}
              onChange={handleInputChange}
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
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
              <p className="text-sm text-muted-foreground">
                Reservas para esta data: {currentReservations}/110
              </p>
            )}
          </div>

          {/* Horário */}
          <div className="space-y-2">
            <Label htmlFor="time" className="flex items-center gap-2 text-foreground">
              <Clock className="w-4 h-4 text-primary" />
              Horário
            </Label>
            <Input
              id="time"
              name="time"
              type="time"
              min="11:00"
              max="23:00"
              value={formData.time}
              onChange={handleInputChange}
              className="bg-input border-border/30 focus:border-primary/50 transition-colors"
            />
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