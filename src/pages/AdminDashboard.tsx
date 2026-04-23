import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar, Users, Plus, Search, Trash2, Edit, Phone, Mail, LogOut, User, CalendarIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuth } from "@/components/AdminAuth";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  parseLocalDate,
  toLocalISO,
  formatDateToDisplay,
  todayLocalISO,
} from "@/lib/date-utils";
import { maskPhone } from "@/lib/phone-mask";
import {
  useReservations,
  useCreateReservation,
  useUpdateReservation,
  useDeleteReservation,
  type Reservation,
} from "@/hooks/useReservations";
import { reservationAdminSchema } from "@/lib/validation";


const AdminDashboard = () => {
  const { user, session, loading: authLoading, isAdmin, signOut } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | undefined>(undefined);
  const [selectedDate, setSelectedDate] = useState("");
  const [displayDate, setDisplayDate] = useState("");
  const [selectedPeriodo, setSelectedPeriodo] = useState("");
  const [selectedGuests, setSelectedGuests] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [formDateObj, setFormDateObj] = useState<Date | undefined>(undefined);

  // Form data for creating/editing reservations
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    guests: 1,
    date: "",
    periodo: "tarde",
  });

  const isAuthed = Boolean(user && session && isAdmin);
  const {
    data: reservations = [],
    isLoading: loading,
    refetch,
  } = useReservations(isAuthed);
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

  // Validação via Zod
  const validateFormData = (): boolean => {
    const result = reservationAdminSchema.safeParse(formData);
    if (!result.success) {
      const first = result.error.issues[0];
      toast({ title: first?.message ?? "Dados inválidos", variant: "destructive" });
      return false;
    }
    return true;
  };

  const createReservation = async () => {
    if (!validateFormData()) return;
    try {
      await createMutation.mutateAsync({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        guests: Number(formData.guests) || 1,
        date: formData.date,
        periodo: formData.periodo,
      });
      toast({ title: "Sucesso", description: "Reserva criada com sucesso!" });
      setShowCreateForm(false);
      resetForm();
    } catch (error: any) {
      toast({
        title: "Erro ao criar reserva",
        description: error?.message || "Não foi possível criar a reserva.",
        variant: "destructive",
      });
    }
  };

  const updateReservation = async () => {
    if (!editingReservation) return;
    if (!validateFormData()) return;
    try {
      await updateMutation.mutateAsync({ id: editingReservation.id, values: formData });
      toast({ title: "Sucesso", description: "Reserva atualizada com sucesso!" });
      setEditingReservation(null);
      resetForm();
      setShowCreateForm(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível atualizar a reserva.",
        variant: "destructive",
      });
    }
  };

  const deleteReservation = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta reserva?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Sucesso", description: "Reserva excluída com sucesso!" });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error?.message || "Não foi possível excluir a reserva.",
        variant: "destructive",
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({ name: "", email: "", phone: "", guests: 1, date: "", periodo: "tarde" });
    setFormDateObj(undefined);
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
      periodo: reservation.periodo,
    });
    setFormDateObj(parseLocalDate(reservation.date));
    setShowCreateForm(true);
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingReservation(null);
    setShowCreateForm(false);
    resetForm();
  };

  // Filter reservations
  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch =
      searchTerm === "" ||
      reservation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phone.includes(searchTerm);

    let matchesDate = !selectedDate || selectedDate === "";
    if (selectedDate) {
      if (displayDate === "Próximos 7 dias") {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const end = new Date(todayStart);
        end.setDate(todayStart.getDate() + 7);
        const reservationDate = parseLocalDate(reservation.date);
        matchesDate = reservationDate >= todayStart && reservationDate <= end;
      } else if (displayDate.startsWith("Semana atual")) {
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

    const matchesPeriodo =
      !selectedPeriodo || selectedPeriodo === "" || reservation.periodo === selectedPeriodo;

    const matchesGuests =
      !selectedGuests ||
      selectedGuests === "" ||
      (selectedGuests === "6"
        ? reservation.guests >= 6
        : reservation.guests.toString() === selectedGuests);

    return matchesSearch && matchesDate && matchesPeriodo && matchesGuests;
  });

  // Quick date filter functions
  const setQuickDateFilter = (type: "today" | "tomorrow" | "week" | "thisWeek" | "next7Days") => {
    switch (type) {
      case "today": {
        const todayISO = todayLocalISO();
        setSelectedDate(todayISO);
        setDisplayDate(formatDateToDisplay(todayISO));
        setSelectedDateFilter(new Date());
        break;
      }
      case "tomorrow": {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        const tomorrowISO = toLocalISO(t);
        setSelectedDate(tomorrowISO);
        setDisplayDate(formatDateToDisplay(tomorrowISO));
        setSelectedDateFilter(t);
        break;
      }
      case "thisWeek": {
        const todayLocal = new Date();
        const startOfWeek = new Date(todayLocal);
        const day = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        const startOfWeekISO = toLocalISO(startOfWeek);
        setSelectedDate(startOfWeekISO);
        setDisplayDate(`Semana atual (${formatDateToDisplay(startOfWeekISO)})`);
        setSelectedDateFilter(undefined);
        break;
      }
      case "next7Days": {
        const next7DaysISO = todayLocalISO();
        setSelectedDate(next7DaysISO);
        setDisplayDate("Próximos 7 dias");
        setSelectedDateFilter(undefined);
        break;
      }
      case "week": {
        setSelectedDate("");
        setDisplayDate("");
        setSelectedDateFilter(undefined);
        break;
      }
    }
  };

  // Calculate statistics
  const totalReservations = reservations.length;
  const totalGuests = reservations.reduce((sum, r) => sum + r.guests, 0);
  const todayReservations = reservations.filter((r) => r.date === todayLocalISO()).length;

  // React Query gerencia o fetch automaticamente quando isAuthed muda


  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in or not admin
  if (!user || !session || !isAdmin) {
    return <AdminAuth />;
  }

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) {
      toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Logout realizado com sucesso!" });
    }
  };

  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold bg-gradient-gold bg-clip-text text-transparent">
              Painel Administrativo
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie reservas e acompanhe estatísticas
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{user.email}</span>
            </div>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
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
                <Label htmlFor="search" className="text-sm font-medium">Buscar Reservas</Label>
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
                <Label className="text-sm font-medium">Filtros Rápidos</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("today")} className="text-xs">Hoje</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("tomorrow")} className="text-xs">Amanhã</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("week")} className="text-xs">Todas</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("thisWeek")} className="text-xs">Esta Semana</Button>
                  <Button variant="outline" size="sm" onClick={() => setQuickDateFilter("next7Days")} className="text-xs">Próximos 7 dias</Button>
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-medium">Data Específica</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !selectedDateFilter && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDateFilter ? format(selectedDateFilter, "dd/MM/yyyy") : "Selecionar data"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={selectedDateFilter}
                        onSelect={(date) => {
                          setSelectedDateFilter(date);
                          if (date) {
                            const isoDate = toLocalISO(date);
                            setSelectedDate(isoDate);
                            setDisplayDate(formatDateToDisplay(isoDate));
                          } else {
                            setSelectedDate("");
                            setDisplayDate("");
                          }
                        }}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                      {selectedDateFilter && (
                        <div className="p-3 border-t">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDateFilter(undefined);
                              setSelectedDate("");
                              setDisplayDate("");
                            }}
                            className="w-full"
                          >
                            Limpar seleção
                          </Button>
                        </div>
                      )}
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label htmlFor="periodo-filter" className="text-sm font-medium">Período</Label>
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
                  <Label htmlFor="guests-filter" className="text-sm font-medium">Nº de Pessoas</Label>
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
                        setSelectedDateFilter(undefined);
                        setSelectedPeriodo("");
                        setSelectedGuests("");
                      }}
                      className="flex-1 text-xs"
                    >
                      Limpar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => refetch()}
                      className="flex-1 text-xs"
                    >
                      Atualizar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Results Counter */}
              <div className="text-sm text-muted-foreground">
                Mostrando {filteredReservations.length} de {reservations.length} reservas
              </div>

              {/* Filter Summary */}
              {(searchTerm || selectedDate || selectedPeriodo || selectedGuests) && (
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <span className="text-muted-foreground">Filtros ativos:</span>
                  {searchTerm && (
                    <Badge variant="secondary" className="text-xs">Busca: "{searchTerm}"</Badge>
                  )}
                  {selectedDate && (
                    <Badge variant="secondary" className="text-xs">
                      Data: {displayDate || formatDateToDisplay(selectedDate)}
                    </Badge>
                  )}
                  {selectedPeriodo && (
                    <Badge variant="secondary" className="text-xs">
                      Período: {selectedPeriodo === "manha" ? "Manhã" : selectedPeriodo === "tarde" ? "Tarde" : "Noite"}
                    </Badge>
                  )}
                  {selectedGuests && (
                    <Badge variant="secondary" className="text-xs">
                      Pessoas: {selectedGuests === "6" ? "6+ pessoas" : `${selectedGuests} pessoa${selectedGuests !== "1" ? "s" : ""}`}
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
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome do cliente"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: maskPhone(e.target.value) })
                        }
                        placeholder="(XX) XXXXX-XXXX"
                        maxLength={16}
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
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="date">Data da Reserva</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal mt-1",
                              !formDateObj && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formDateObj ? format(formDateObj, "dd/MM/yyyy") : "Selecionar data"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={formDateObj}
                            onSelect={(date) => {
                              setFormDateObj(date);
                              setFormData({ ...formData, date: date ? toLocalISO(date) : "" });
                            }}
                            disabled={(date) => date < todayDate}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label htmlFor="periodo">Período</Label>
                      <select
                        id="periodo"
                        value={formData.periodo}
                        onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
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
                  <div className="text-6xl mb-4 text-muted-foreground">📋</div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma reserva encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {reservations.length === 0
                      ? "Ainda não há reservas cadastradas. Que tal criar algumas?"
                      : "Nenhuma reserva corresponde aos filtros aplicados."}
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={() => setShowCreateForm(true)} className="bg-primary hover:bg-primary/90">
                      Nova Reserva
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReservations.map((reservation) => (
                  <Card
                    key={reservation.id}
                    className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary"
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Main Info */}
                          <div>
                            <h3 className="font-bold text-xl text-foreground">{reservation.name}</h3>
                            <p className="text-xl italic text-muted-foreground">{reservation.phone}</p>
                          </div>

                          {/* Highlighted Reservation Details */}
                          <div className="flex flex-wrap gap-3 mb-3">
                            <Badge variant="default" className="px-3 py-1 text-sm font-medium">
                              <Calendar className="w-4 h-4 mr-2" />
                              {format(parseLocalDate(reservation.date), "dd/MM/yyyy")}
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                              <Users className="w-4 h-4 mr-2" />
                              {reservation.guests} {reservation.guests === 1 ? "pessoa" : "pessoas"}
                            </Badge>
                            <Badge
                              variant={reservation.periodo === "tarde" ? "outline" : "secondary"}
                              className="px-3 py-1 text-sm font-medium"
                            >
                              {reservation.periodo === "tarde" ? "Tarde" : "Noite"}
                            </Badge>
                          </div>

                          {/* Secondary Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">{reservation.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{reservation.phone}</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 lg:flex-col">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(reservation)}
                            className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground"
                          >
                            <Edit className="w-4 h-4" />
                            <span className="hidden sm:inline">Editar</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteReservation(reservation.id)}
                            className="flex items-center gap-2 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Excluir</span>
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
