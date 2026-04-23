import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { sendReservationWebhook } from "@/lib/webhook";

export type ReservationStatus = "pending" | "confirmed" | "cancelled";

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: string;
  status: ReservationStatus;
  message?: string;
  created_at: string;
}

export interface ReservationLog {
  id: string;
  reservation_id: string;
  old_status: string | null;
  new_status: string;
  note: string | null;
  changed_at: string;
}

export interface ReservationCapacity {
  seatsBooked: number;
  seatsRemaining: number;
  capacity: number;
}

export interface ReservationStatusByPeriod {
  capacity: number;
  total: { booked: number; remaining: number };
  tarde: { booked: number; remaining: number };
  noite: { booked: number; remaining: number };
}

export type ReservationInput = Omit<Reservation, "id" | "created_at" | "status"> & {
  status?: ReservationStatus;
};

const RESERVATIONS_KEY = ["reservations"] as const;

/* ---------------- Status do dia por período (público) ---------------- */

export const useReservationStatusByPeriod = (date: string | null | undefined) => {
  return useQuery<ReservationStatusByPeriod | null>({
    queryKey: ["reservation-status-by-period", date],
    enabled: Boolean(date),
    queryFn: async () => {
      if (!date) return null;
      // @ts-ignore RPC tipo opcional
      const { data, error } = await supabase.rpc("get_reservations_status_by_period", {
        target_date: date,
      });
      if (error) throw error;
      const row = (data as any[])?.[0];
      if (!row) {
        return {
          capacity: 110,
          total: { booked: 0, remaining: 110 },
          tarde: { booked: 0, remaining: 110 },
          noite: { booked: 0, remaining: 110 },
        };
      }
      return {
        capacity: row.capacity ?? 110,
        total: {
          booked: row.seats_booked_total ?? 0,
          remaining: row.seats_remaining_total ?? 110,
        },
        tarde: {
          booked: row.seats_booked_tarde ?? 0,
          remaining: row.seats_remaining_tarde ?? 110,
        },
        noite: {
          booked: row.seats_booked_noite ?? 0,
          remaining: row.seats_remaining_noite ?? 110,
        },
      };
    },
  });
};

/* ---------------- Lista (admin) + Realtime ---------------- */

export const useReservations = (enabled: boolean) => {
  const qc = useQueryClient();

  const query = useQuery<Reservation[]>({
    queryKey: RESERVATIONS_KEY,
    enabled,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as Reservation[]) ?? [];
    },
  });

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel("reservations-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reservations" },
        (payload) => {
          qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
          if (payload.eventType === "INSERT") {
            const newRes = payload.new as Reservation;
            toast({
              title: "Nova Reserva Recebida! 🛎️",
              description: `${newRes.name} — ${newRes.guests} pessoas para ${newRes.periodo === "tarde" ? "Tarde" : "Noite"}`,
              className: "bg-primary border-primary text-primary-foreground",
              duration: 5000,
            });
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, qc]);

  return query;
};

/* ---------------- Mutations (admin) ---------------- */

export const useCreateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ReservationInput) => {
      const { error, data } = await supabase
        .from("reservations")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;

      // Disparo do Webhook (Fire-and-Forget)
      sendReservationWebhook({
        ...data,
        source: "admin_panel"
      });

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
};

export const useUpdateReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; values: Partial<ReservationInput> }) => {
      const { error } = await supabase
        .from("reservations")
        .update(params.values)
        .eq("id", params.id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
};

export const useDeleteReservation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("reservations").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
};

/* ---------------- Logs (admin) ---------------- */

export const useReservationLogs = (reservationId: string | null | undefined) => {
  return useQuery<ReservationLog[]>({
    queryKey: ["reservation-logs", reservationId],
    enabled: Boolean(reservationId),
    queryFn: async () => {
      if (!reservationId) return [];
      const { data, error } = await supabase
        .from("reservation_logs")
        .select("*")
        .eq("reservation_id", reservationId)
        .order("changed_at", { ascending: false });
      
      // If table doesn't exist yet (migration not run), just return empty array instead of failing
      if (error) {
        if (error.code === '42P01') return []; // relation does not exist
        throw error;
      }
      return (data as ReservationLog[]) ?? [];
    },
  });
};
