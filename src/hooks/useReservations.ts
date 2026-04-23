import { useEffect } from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Reservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  periodo: string;
  created_at: string;
}

export interface ReservationStatus {
  seatsBooked: number;
  seatsRemaining: number;
  capacity: number;
}

export type ReservationInput = Omit<Reservation, "id" | "created_at">;

const RESERVATIONS_KEY = ["reservations"] as const;

/* ---------------- Status do dia (público) ---------------- */

export const useReservationStatus = (date: string | null | undefined) => {
  return useQuery<ReservationStatus | null>({
    queryKey: ["reservation-status", date],
    enabled: Boolean(date),
    queryFn: async () => {
      if (!date) return null;
      // @ts-ignore RPC tipo opcional
      const { data, error } = await supabase.rpc("get_reservations_status", {
        target_date: date,
      });
      if (error) throw error;
      const row = (data as any[])?.[0];
      if (!row) {
        return { seatsBooked: 0, seatsRemaining: 110, capacity: 110 };
      }
      return {
        seatsBooked: row.seats_booked ?? 0,
        seatsRemaining: row.seats_remaining ?? 110,
        capacity: row.capacity ?? 110,
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
        () => {
          qc.invalidateQueries({ queryKey: RESERVATIONS_KEY });
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
