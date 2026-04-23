import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface AdminHeaderProps {
  email: string;
  onLogout: () => void;
}

export const AdminHeader = ({ email, onLogout }: AdminHeaderProps) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div className="flex-1">
      <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
        Painel Administrativo
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Gerencie reservas e acompanhe estatísticas
      </p>
    </div>
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
        <User className="h-4 w-4" />
        <span>{email}</span>
      </div>
      <Button
        variant="outline"
        onClick={onLogout}
        className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
      >
        <LogOut className="h-4 w-4" />
        Sair
      </Button>
    </div>
  </div>
);
