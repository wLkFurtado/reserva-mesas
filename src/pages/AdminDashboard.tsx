import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, List, CalendarDays } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { AdminAuth } from "@/components/AdminAuth";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminStatsCards } from "@/components/admin/AdminStatsCards";
import { AdminCapacityBar } from "@/components/admin/AdminCapacityBar";
import { AdminFilters } from "@/components/admin/AdminFilters";
import { AdminReservationTable } from "@/components/admin/AdminReservationTable";
import { AdminReservationForm } from "@/components/admin/AdminReservationForm";
import { AdminReservationDetails } from "@/components/admin/AdminReservationDetails";
import { ReservationCalendar } from "@/components/admin/ReservationCalendar";
import { useAdminFilters } from "@/hooks/useAdminFilters";
import {
  useReservations,
  useCreateReservation,
  useUpdateReservation,
  useDeleteReservation,
  type Reservation,
  type ReservationStatus,
} from "@/hooks/useReservations";

const AdminDashboard = () => {
  const { user, session, loading: authLoading, isAdmin, signOut } = useAuth();
  const isAuthed = Boolean(user && session && isAdmin);
  const filters = useAdminFilters();

  const { data: reservations = [], isLoading: loading, refetch } = useReservations(isAuthed);
  const createMutation = useCreateReservation();
  const updateMutation = useUpdateReservation();
  const deleteMutation = useDeleteReservation();

  const [tab, setTab] = useState<"list" | "calendar">("list");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Reservation | null>(null);
  const [viewing, setViewing] = useState<Reservation | null>(null);

  const filtered = useMemo(
    () => reservations.filter(filters.matches),
    [reservations, filters.matches]
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user || !session || !isAdmin) return <AdminAuth />;

  const handleLogout = async () => {
    const { error } = await signOut();
    if (error) toast({ title: "Erro ao sair", description: error.message, variant: "destructive" });
    else toast({ title: "Logout realizado com sucesso!" });
  };

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (r: Reservation) => {
    setEditing(r);
    setFormOpen(true);
  };

  const handleSubmit = async (values: any, editingId?: string) => {
    try {
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, values });
        toast({ title: "Reserva atualizada" });
      } else {
        await createMutation.mutateAsync({
          name: values.name.trim(),
          email: values.email.trim(),
          phone: values.phone.trim(),
          guests: Number(values.guests) || 1,
          date: values.date,
          periodo: values.periodo,
          status: values.status,
        });
        toast({ title: "Reserva criada" });
      }
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao salvar", variant: "destructive" });
      throw e;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
      toast({ title: "Reserva excluída" });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message ?? "Falha ao excluir", variant: "destructive" });
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    try {
      await updateMutation.mutateAsync({ id, values: { status } });
      toast({ title: "Status atualizado" });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    }
  };

  const handleBulkStatus = async (ids: string[], status: ReservationStatus) => {
    try {
      await Promise.all(ids.map((id) => updateMutation.mutateAsync({ id, values: { status } })));
      toast({ title: `${ids.length} reserva(s) atualizadas` });
    } catch (e: any) {
      toast({ title: "Erro", description: e?.message, variant: "destructive" });
    }
  };

  const showCapacityBar = filters.state.dateMode === "exact" && !!filters.state.date;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <AdminHeader email={user.email ?? ""} onLogout={handleLogout} />

        <AdminStatsCards 
          reservations={reservations} 
          selectedDate={filters.state.dateMode === "exact" && filters.state.date ? filters.state.date : undefined}
        />

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <CardTitle>Reservas</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <ExportCsvButton reservations={filtered} />
                <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" /> Nova Reserva
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
              <TabsList>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" /> Lista
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <CalendarDays className="h-4 w-4" /> Calendário
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4 mt-4">
                <AdminFilters
                  filters={filters}
                  onRefresh={() => refetch()}
                  resultCount={filtered.length}
                  totalCount={reservations.length}
                />

                {showCapacityBar && <AdminCapacityBar date={filters.state.date} />}

                <AdminReservationTable
                  reservations={filtered}
                  loading={loading}
                  sortKey={filters.state.sortKey}
                  sortDir={filters.state.sortDir}
                  page={filters.state.page}
                  onSort={(sortKey, sortDir) => filters.update({ sortKey, sortDir, page: 1 })}
                  onPage={(page) => filters.update({ page })}
                  onView={setViewing}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onUpdateStatus={handleUpdateStatus}
                  onBulkStatus={handleBulkStatus}
                  onCreate={openCreate}
                />
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                <ReservationCalendar
                  reservations={reservations}
                  onSelectDate={(iso) => {
                    filters.update({ date: iso, dateMode: "exact" });
                    setTab("list");
                  }}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AdminReservationForm
        open={formOpen}
        editing={editing}
        onClose={() => { setFormOpen(false); setEditing(null); }}
        onSubmit={handleSubmit}
      />

      <AdminReservationDetails
        reservation={viewing}
        onClose={() => setViewing(null)}
        onEdit={openEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdminDashboard;
