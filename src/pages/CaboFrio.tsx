import BarReservationForm from "@/components/BarReservationForm";

const CaboFrio = () => (
  <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--gold-primary)/0.1)_0%,transparent_50%)] pointer-events-none" />
    <header className="relative z-10 pt-8 pb-4">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
          Boteco Seu Osmar
        </h1>
        <p className="text-lg text-muted-foreground">Cabo Frio</p>
      </div>
    </header>
    <main className="relative z-10 py-12">
      <div className="container mx-auto px-4">
        <BarReservationForm bar="cabofrio" />
      </div>
    </main>
  </div>
);

export default CaboFrio;
