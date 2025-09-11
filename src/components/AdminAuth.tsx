import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { LogIn } from 'lucide-react';

export const AdminAuth = () => {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      toast({ title: 'Preencha todos os campos', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await signIn(loginForm.email, loginForm.password);
    
    if (error) {
      toast({ 
        title: 'Erro ao fazer login', 
        description: error.message,
        variant: 'destructive' 
      });
    } else {
      toast({ title: 'Login realizado com sucesso!' });
    }
    
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gradient-elegant border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">
            Admin Dashboard
          </CardTitle>
          <p className="text-muted-foreground">
            Acesse o painel administrativo
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="admin@exemplo.com"
                className="bg-input border-border"
              />
            </div>
            <div>
              <Label htmlFor="login-password">Senha</Label>
              <Input
                id="login-password"
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                placeholder="••••••••"
                className="bg-input border-border"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2" 
              disabled={loading}
            >
              <LogIn className="h-4 w-4" />
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};