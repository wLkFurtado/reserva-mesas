import ReservationForm from "@/components/ReservationForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-dark relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,hsl(var(--gold-primary)/0.1)_0%,transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--gold-secondary)/0.05)_0%,transparent_50%)] pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 pt-8 pb-4">
        <div className="container mx-auto px-4 text-center">
          <img 
            src="/lovable-uploads/217466e6-0237-451b-8c09-883c5b7422d0.png"
            alt="Tróia Restaurante"
            className="mx-auto h-24 w-auto mb-4 opacity-90"
          />
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-gold bg-clip-text text-transparent mb-2">
            Tróia Restaurante
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Uma experiência gastronômica excepcional no coração de Cabo Frio
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 py-12">
        <div className="container mx-auto px-4">
          <ReservationForm />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Tróia Restaurante - Todos os direitos reservados
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;