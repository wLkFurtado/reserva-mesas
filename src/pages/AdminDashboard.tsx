import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Plus, Search, Trash2, Edit, Phone, Mail, LogOut, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuth } from "@/components/AdminAuth";
import { format } from "date-fns";

interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { user, session, loading: authLoading, isAdmin, signOut } = useAuth();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [formDisplayDate, setFormDisplayDate] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [selectedGuests, setSelectedGuests] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  
  // Form data for creating/editing reservations
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    date: "",
    periodo: "tarde"
  });

  // Validação do formulário (Admin)
  const validateFormData = (): boolean => {
    if (!formData.name.trim()) { toast({ title: "Nome é obrigatório", variant: "destructive" }); return false; }
    if (!formData.email.trim()) { toast({ title: "Email é obrigatório", variant: "destructive" }); return false; }
    if (!formData.phone.trim()) { toast({ title: "Telefone é obrigatório", variant: "destructive" }); return false; }
    if (!formData.date) { toast({ title: "Data é obrigatória", variant: "destructive" }); return false; }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      toast({ title: "Data inválida", description: "Use o formato dd/mm/aaaa", variant: "destructive" });
      return false;
    }
    if (!formData.periodo) { toast({ title: "Período é obrigatório", variant: "destructive" }); return false; }
    if (formData.guests < 1) { toast({ title: "Número de pessoas deve ser maior que 0", variant: "destructive" }); return false; }
    return true;
  };

  // Fetch reservations from Supabase
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Erro ao buscar reservas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar as reservas.",
          variant: "destructive"
        });
      } else {
        setReservations(data || []);
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new reservation
  const createReservation = async () => {
    if (!validateFormData()) return;

    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        guests: Number(formData.guests) || 1,
        date: formData.date, // deve estar no formato YYYY-MM-DD
        periodo: formData.periodo,
      };

      const { error } = await supabase
        .from("reservations")
        .insert([payload]);

      if (error) {
        console.error("Erro ao criar reserva:", error);
        toast({
          title: "Erro ao criar reserva",
          description: error.message || "Não foi possível criar a reserva.",
          variant: "destructive"
        });
        return;
      }

      console.log("✅ Reserva criada com sucesso");
      toast({
        title: "Sucesso",
        description: "Reserva criada com sucesso!"
      });
      setShowCreateForm(false);
      resetForm();
      fetchReservations();
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast({
        title: "Erro inesperado",
        description: "Tente novamente em instantes.",
        variant: "destructive"
      });
    }
  };

  // Update reservation
  const updateReservation = async () => {
    if (!editingReservation) return;

    try {
      const { error } = await supabase
        .from("reservations")
        .update(formData)
        .eq("id", editingReservation.id);

      if (error) {
        console.error("Erro ao atualizar reserva:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a reserva.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Reserva atualizada com sucesso!"
        });
        setEditingReservation(null);
        resetForm();
        fetchReservations();
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };


  // Delete reservation
  const deleteReservation = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;

    try {
      const { error } = await supabase
        .from("reservations")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir reserva:", error);
        toast({
          title: "Erro",
          description: "Não foi possível excluir a reserva.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Sucesso",
          description: "Reserva excluída com sucesso!"
        });
        fetchReservations();
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      guests: 1,
      date: "",
      periodo: "tarde"
    });
    setFormDisplayDate("");
  };

  // Start editing
  const startEdit = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      name: reservation.name,
      email: reservation.email,
      phone: reservation.phone,
      guests: reservation.guests,
      date: reservation.date,
      periodo: reservation.periodo
    });
    setFormDisplayDate(formatDateToDisplay(reservation.date));
    setShowCreateForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingReservation(null);
    setShowCreateForm(false);
    resetForm();
  };

  // Filter reservations
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = searchTerm === '' || 
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm);
    
    let matchesDate = !selectedDate || selectedDate === '';
    if (selectedDate) {
      if (displayDate === "Próximos 7 dias") {
        // Próximos 7 dias a partir de hoje (meia-noite local)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const end = new Date(todayStart);
        end.setDate(todayStart.getDate() + 7);
        const reservationDate = parseLocalDate(reservation.date);
        matchesDate = reservationDate >= todayStart && reservationDate <= end;
      } else if (displayDate.startsWith("Semana atual")) {
        // Semana atual (Segunda a Domingo) em horário local
        const todayLocal = new Date();
        const startOfWeek = new Date(todayLocal);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        const reservationDate = parseLocalDate(reservation.date);
        matchesDate = reservationDate >= startOfWeek && reservationDate <= endOfWeek;
      } else {
        matchesDate = reservation.date === selectedDate;
      }
    }
    
    const matchesPeriodo = !selectedPeriodo || selectedPeriodo === '' || 
      reservation.periodo === selectedPeriodo;
      
    const matchesGuests = !selectedGuests || selectedGuests === '' || 
      (selectedGuests === '6' ? reservation.guests >= 6 : 
       reservation.guests.toString() === selectedGuests);
    
    return matchesSearch && matchesDate && matchesPeriodo && matchesGuests;
  });

  // Date formatting functions
  const formatDateToDisplay = (isoDate: string) => {
    if (!isoDate) return "";
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  const formatDateToISO = (displayDate: string) => {
    if (!displayDate) return "";
    
    // Remover espaços e verificar se tem pelo menos 8 caracteres (dd/mm/yy)
    const cleaned = displayDate.trim();
    if (cleaned.length < 8) return "";
    
    const [day, month, year] = cleaned.split('/');
    if (!day || !month || !year) return "";
    
    // Validar se a data é válida
    const dayNum = parseInt(day, 10);
    const monthNum = parseInt(month, 10);
    let yearNum = parseInt(year, 10);
    
    // Se o ano tem 2 dígitos, assumir 20xx
    if (year.length === 2) {
      yearNum = 2000 + yearNum;
    }
    
    if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return "";
    if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000) return "";
    
    // Formatar com zeros à esquerda
    const formattedDay = dayNum.toString().padStart(2, '0');
    const formattedMonth = monthNum.toString().padStart(2, '0');
    
    return `${yearNum}-${formattedMonth}-${formattedDay}`;
  };

  // Helpers para evitar mudança de dia por fuso (sempre horário local)
  const toLocalISO = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const parseLocalDate = (isoDate: string) => new Date(`${isoDate}T00:00:00`);


  const handleDateChange = (value: string) => {
    // Remove caracteres não numéricos exceto /
    const cleaned = value.replace(/[^\d\/]/g, '');
    
    // Aplicar máscara dd/mm/yyyy
    let formatted = cleaned;
    if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    if (formatted.length > 10) {
      formatted = formatted.slice(0, 10);
    }
    
    setDisplayDate(formatted);
    
    // Converter para ISO se a data estiver completa
    const isoDate = formatDateToISO(formatted);
    setSelectedDate(isoDate);
  };

  const handleFormDateChange = (value: string) => {
    // Remove caracteres não numéricos exceto /
    const cleaned = value.replace(/[^\d\/]/g, '');
    
    // Aplicar máscara dd/mm/yyyy
    let formatted = cleaned;
    if (cleaned.length >= 2 && cleaned.charAt(2) !== '/') {
      formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    }
    if (cleaned.length >= 5 && cleaned.charAt(5) !== '/') {
      formatted = formatted.slice(0, 5) + '/' + formatted.slice(5);
    }
    if (formatted.length > 10) {
      formatted = formatted.slice(0, 10);
    }
    
    setFormDisplayDate(formatted);
    
    // Converter para ISO se a data estiver completa
    const isoDate = formatDateToISO(formatted);
    setFormData({...formData, date: isoDate});
  };

  // Quick date filter functions
  const setQuickDateFilter = (type: 'today' | 'tomorrow' | 'week' | 'thisWeek' | 'next7Days') => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    switch (type) {
      case 'today': {
        const todayISO = toLocalISO(new Date());
        setSelectedDate(todayISO);
        setDisplayDate(formatDateToDisplay(todayISO));
        break;
      }
      case 'tomorrow': {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        const tomorrowISO = toLocalISO(t);
        setSelectedDate(tomorrowISO);
        setDisplayDate(formatDateToDisplay(tomorrowISO));
        break;
      }
      case 'thisWeek': {
        // Show reservations for the current week (Monday to Sunday) em horário local
        const todayLocal = new Date();
        const startOfWeek = new Date(todayLocal);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
        startOfWeek.setDate(diff);
        const startOfWeekISO = toLocalISO(startOfWeek);
        setSelectedDate(startOfWeekISO);
        setDisplayDate(`Semana atual (${formatDateToDisplay(startOfWeekISO)})`);
        break;
      }
      case 'next7Days': {
        // Show reservations for the next 7 days starting from today (local)
        const next7DaysISO = toLocalISO(new Date());
        setSelectedDate(next7DaysISO);
        setDisplayDate("Próximos 7 dias");
        break;
      }
      case 'week': {
        // For week, we'll clear the date filter and let user see all
        setSelectedDate("");
        setDisplayDate("");
        break;
      }
    }
  };

  // Calculate statistics
  const totalReservations = reservations.length;
  const totalGuests = reservations.reduce((sum, r) => sum + r.guests, 0);
  const todayReservations = reservations.filter(r => r.date === toLocalISO(new Date())).length;

  useEffect(() => {
    fetchReservations();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
            Painel Administrativo
          </h1>
          <p className="text-muted-foreground">
            Gerencie todas as reservas do Tróia Restaurante
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Reservas</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReservations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Pessoas</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGuests}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reservas Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayReservations}</div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <CardTitle>Reservas</CardTitle>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Reserva
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="bg-muted/30 p-4 rounded-lg border space-y-4">
              {/* Search Bar */}
              <div className="flex-1">
                <Label htmlFor="search" className="text-sm font-medium">🔍 Buscar Reservas</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Nome, email ou telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Quick Date Filters */}
              <div>
                <Label className="text-sm font-medium">⚡ Filtros Rápidos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('today')}
                    className="text-xs"
                  >
                    📅 Hoje
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('tomorrow')}
                    className="text-xs"
                  >
                    📅 Amanhã
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('week')}
                    className="text-xs"
                  >
                    📅 Todas
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('thisWeek' as any)}
                    className="text-xs"
                  >
                    📅 Esta Semana
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setQuickDateFilter('next7Days' as any)}
                    className="text-xs"
                  >
                    📅 Próximos 7 dias
                  </Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="date-filter" className="text-sm font-medium">📅 Data Específica</Label>
                  <Input
                    id="date-filter"
                    type="text"
                    placeholder="dd/mm/yyyy"
                    value={displayDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="mt-1"
                    maxLength={10}
                  />
                </div>
                
                <div>
                  <Label htmlFor="periodo-filter" className="text-sm font-medium">🕐 Período</Label>
                  <select
                    id="periodo-filter"
                    value={selectedPeriodo}
                    onChange={(e) => setSelectedPeriodo(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Todos os períodos</option>
                    <option value="manha">Manhã</option>
                    <option value="tarde">Tarde</option>
                    <option value="noite">Noite</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="guests-filter" className="text-sm font-medium">👥 Nº de Pessoas</Label>
                  <select
                    id="guests-filter"
                    value={selectedGuests}
                    onChange={(e) => setSelectedGuests(e.target.value)}
                    className="mt-1 w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  >
                    <option value="">Qualquer quantidade</option>
                    <option value="1">1 pessoa</option>
                    <option value="2">2 pessoas</option>
                    <option value="3">3 pessoas</option>
                    <option value="4">4 pessoas</option>
                    <option value="5">5 pessoas</option>
                    <option value="6">6+ pessoas</option>
                  </select>
                </div>
                
                <div className="flex flex-col justify-end">
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedDate("");
                        setDisplayDate("");
                        setSelectedPeriodo("");
                        setSelectedGuests("");
                      }}
                      className="flex-1 text-xs"
                    >
                      🗑️ Limpar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={fetchReservations}
                      className="flex-1 text-xs"
                    >
                      🔄 Atualizar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Counter */}
              <div className="text-sm text-muted-foreground">
                📊 Mostrando {filteredReservations.length} de {reservations.length} reservas
              </div>
              
              {/* Filter Summary */}
              {(searchTerm || selectedDate || selectedPeriodo || selectedGuests) && (
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="text-muted-foreground">🏷️ Filtros ativos:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">
                      🔍 "{searchTerm}"
                    </Badge>
                  )}
                  {selectedDate && (
                    <Badge variant="secondary" className="text-xs">
                      📅 {formatDateToDisplay(selectedDate)}
                    </Badge>
                  )}
                  {selectedPeriodo && (
                    <Badge variant="secondary" className="text-xs">
                      🕐 {selectedPeriodo === 'manha' ? 'Manhã' : selectedPeriodo === 'tarde' ? 'Tarde' : 'Noite'}
                    </Badge>
                  )}
                  {selectedGuests && (
                    <Badge variant="secondary" className="text-xs">
                      👥 {selectedGuests === '6' ? '6+ pessoas' : `${selectedGuests} pessoa${selectedGuests !== '1' ? 's' : ''}`}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Create/Edit Form */}
            {showCreateForm && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>
                    {editingReservation ? "Editar Reserva" : "Nova Reserva"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="(XX) XXXXX-XXXX"
                      />
                    </div>
                    <div>
                      <Label htmlFor="guests">Número de Pessoas</Label>
                      <Input
                        id="guests"
                        type="number"
                        min="1"
                        max="50"
                        value={formData.guests}
                        onChange={(e) => setFormData({...formData, guests: parseInt(e.target.value) || 1})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Data da Reserva</Label>
                      <Input
                        id="date"
                        type="text"
                        placeholder="dd/mm/yyyy"
                        value={formDisplayDate}
                        onChange={(e) => handleFormDateChange(e.target.value)}
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <Label htmlFor="periodo">Período</Label>
                      <select
                        id="periodo"
                        value={formData.periodo}
                        onChange={(e) => setFormData({...formData, periodo: e.target.value})}
                        className="w-full px-3 py-2 border border-input bg-background rounded-md"
                      >
                        <option value="tarde">Tarde</option>
                        <option value="noite">Noite</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      onClick={editingReservation ? updateReservation : createReservation}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {editingReservation ? "Atualizar" : "Criar"} Reserva
                    </Button>
                    <Button variant="outline" onClick={cancelEdit}>
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reservations List */}
            {loading ? (
              <div className="flex flex-col justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Carregando reservas...</p>
              </div>
            ) : filteredReservations.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-muted/50 rounded-lg p-8 border-2 border-dashed border-muted-foreground/25">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {reservations.length === 0 
                      ? "Ainda não há reservas cadastradas. Que tal criar algumas?" 
                      : "Nenhuma reserva corresponde aos filtros aplicados."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
                      ➕ Nova Reserva
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <Card key={reservation.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-primary">
                                {reservation.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-xl text-foreground">{reservation.name}</h3>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant={reservation.periodo === "tarde" ? "default" : "secondary"} className="text-xs">
                                  {reservation.periodo === "tarde" ? "🌅 Tarde" : "🌙 Noite"}
                                </Badge>
                                <Badge variant="outline" className="text-xs">
                                  👥 {reservation.guests} {reservation.guests === 1 ? "pessoa" : "pessoas"}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                              <Mail className="w-4 h-4 text-blue-500" />
                              <span className="truncate">{reservation.email}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                              <Phone className="w-4 h-4 text-green-500" />
                              <span>{reservation.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 p-2 bg-muted/30 rounded-md">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              <span className="font-medium">{format(parseLocalDate(reservation.date), "dd/MM/yyyy")}</span>
                            </div>
                          </div>
                          
                          <p className="text-xs text-muted-foreground border-t pt-2">
                            📅 Criada em: {format(new Date(reservation.created_at), "dd/MM/yyyy 'às' HH:mm")}
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(reservation)}
                            className="hover:bg-blue-50 hover:border-blue-300"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteReservation(reservation.id)}
                            className="hover:bg-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;