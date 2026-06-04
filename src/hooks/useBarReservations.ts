import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { BARS, type BarId } from "@/lib/bars";

export type BarReservationStatus = "pending" | "confirmed" | "cancelled";

export interface BarReservation {
  id: string;
  name: string;
  email: string;
  phone: string;
  guests: number;
  date: string;
  local: string;
  status: BarReservationStatus;
  message?: string | null;
  created_at: string;
}

export type BarReservationInput = Omit<BarReservation, "id" | "created_at" | "status"> & {
  status?: BarReservationStatus;
};

const keyFor = (bar: BarId) => ["bar-reservations", bar] as const;

export const useBarReservations = (bar: BarId, enabled: boolean) => {
  const qc = useQueryClient();
  const table = BARS[bar].table;

  const query = useQuery<BarReservation[]>({
    queryKey: keyFor(bar),
    enabled,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from(table)
        .select("*")
        .order("date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data as BarReservation[]) ?? [];
    },
  });

  useEffect(() => {
    if (!enabled) return;
    const channel = supabase
      .channel(`${table}-realtime`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table },
        (payload) => {
          qc.invalidateQueries({ queryKey: keyFor(bar) });
          if (payload.eventType === "INSERT") {
            const r = payload.new as BarReservation;
            toast({
              title: `Nova reserva — ${BARS[bar].shortName}`,
              description: `${r.name} — ${r.guests} pessoa(s) — ${r.local}`,
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
  }, [enabled, qc, table, bar]);

  return query;
};

export const useCreateBarReservation = (bar: BarId) => {
  const qc = useQueryClient();
  const table = BARS[bar].table;
  return useMutation({
    mutationFn: async (payload: BarReservationInput) => {
      const { error, data } = await (supabase as any)
        .from(table)
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keyFor(bar) }),
  });
};

export const useUpdateBarReservation = (bar: BarId) => {
  const qc = useQueryClient();
  const table = BARS[bar].table;
  return useMutation({
    mutationFn: async (p: { id: string; values: Partial<BarReservationInput> }) => {
      const { error } = await (supabase as any).from(table).update(p.values).eq("id", p.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keyFor(bar) }),
  });
};

export const useDeleteBarReservation = (bar: BarId) => {
  const qc = useQueryClient();
  const table = BARS[bar].table;
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from(table).delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: keyFor(bar) }),
  });
};
