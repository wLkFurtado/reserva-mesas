import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, MapPin, Users } from "lucide-react";

const ThankYou = () => {
  const [searchParams] = useSearchParams();
  const [reservationDetails, setReservationDetails] = useState({
    name: "",
    date: "",
    periodo: "",
    guests: ""
  });

  useEffect(() => {
    setReservationDetails({
      name: searchParams.get("name") || "",
      date: searchParams.get("date") || "",
      periodo: searchParams.get("periodo") || "",
      guests: searchParams.get("guests") || ""
    });
  }, [searchParams]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    // garantir parsing em horário local para evitar mudança de dia
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };

  const getPeriodoText = (periodo: string) => {
    return periodo === "tarde" ? "Tarde (12:00 - 18:00)" : "Noite (18:00 - 23:00)";
  };

  const getFinalizationTime = (periodo: string) => {
    return periodo === "tarde" ? "14:00" : "19:00";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-primary via-dark-secondary to-dark-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/95 backdrop-blur-sm border-border/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Reserva Confirmada!
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Obrigado, {reservationDetails.name}! Sua reserva foi registrada com sucesso.
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Detalhes da Reserva */}
          <div className="bg-muted/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Detalhes da Reserva
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span><strong>Data:</strong> {formatDate(reservationDetails.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span><strong>Período:</strong> {getPeriodoText(reservationDetails.periodo)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span><strong>Pessoas:</strong> {reservationDetails.guests}</span>
              </div>
            </div>
          </div>

          {/* Informações Importantes */}
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-lg text-primary">
              📋 Informações Importantes
            </h3>
            <div className="space-y-3 text-sm text-foreground">
              <p>
                Reservamos conforme a solicitação feita, nossas reservas são finalizadas às <strong>{getFinalizationTime(reservationDetails.periodo)}</strong> e damos 15 minutos de tolerância, cheguem cedo e aproveitem toda a experiência de entretenimento no <strong>TROIA LOUNGE ROOFTOP</strong> para garantir os assentos solicitados pedimos que todos os convidados da reserva cheguem no horário.
              </p>
              <p>
                Reservas serão feitas no local determinado, mediante disponibilidade.
              </p>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">🚩</span>
                  <span><strong>Exemplo:</strong> Caso dê o horário da reserva, a casa se coloca no direito de finalizar a mesma e disponibilizar as mesas e cadeiras para clientes que estejam aguardando atendimento na fila de espera.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Retorno */}
          <div className="text-center pt-4">
            <Link to="/">
              <Button className="bg-gradient-gold hover:shadow-gold-glow transition-all duration-300 text-dark-primary font-semibold px-8 py-3">
                Fazer Nova Reserva
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThankYou;