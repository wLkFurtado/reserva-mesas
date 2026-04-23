import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseLocalDate, formatDateToDisplay, todayLocalISO, toLocalISO } from "@/lib/date-utils";
import type { Reservation } from "@/hooks/useReservations";

export type DateMode = "" | "exact" | "next7" | "thisWeek";

export interface AdminFiltersState {
  search: string;
  date: string; // YYYY-MM-DD anchor
  dateMode: DateMode;
  periodo: string;
  guests: string;
  status: string;
  sortKey: string;
  sortDir: "asc" | "desc";
  page: number;
}

const DEFAULTS: AdminFiltersState = {
  search: "",
  date: "",
  dateMode: "",
  periodo: "",
  guests: "",
  status: "",
  sortKey: "date",
  sortDir: "desc",
  page: 1,
};

export const useAdminFilters = () => {
  const [params, setParams] = useSearchParams();

  const state: AdminFiltersState = useMemo(() => ({
    search: params.get("q") ?? DEFAULTS.search,
    date: params.get("date") ?? DEFAULTS.date,
    dateMode: (params.get("dateMode") as DateMode) ?? DEFAULTS.dateMode,
    periodo: params.get("periodo") ?? DEFAULTS.periodo,
    guests: params.get("guests") ?? DEFAULTS.guests,
    status: params.get("status") ?? DEFAULTS.status,
    sortKey: params.get("sortKey") ?? DEFAULTS.sortKey,
    sortDir: (params.get("sortDir") as "asc" | "desc") ?? DEFAULTS.sortDir,
    page: parseInt(params.get("page") ?? "1", 10) || 1,
  }), [params]);

  const update = useCallback((patch: Partial<AdminFiltersState>) => {
    setParams((prev) => {
      const next = new URLSearchParams(prev);
      const merged = { ...state, ...patch };
      // reset page to 1 if any non-page filter changes
      const filterChanged = Object.keys(patch).some((k) => k !== "page" && k !== "sortKey" && k !== "sortDir");
      if (filterChanged && patch.page === undefined) merged.page = 1;

      const setOrDelete = (key: string, value: string | number, def: string | number) => {
        if (value === def || value === "" || value === undefined || value === null) next.delete(key);
        else next.set(key, String(value));
      };
      setOrDelete("q", merged.search, "");
      setOrDelete("date", merged.date, "");
      setOrDelete("dateMode", merged.dateMode, "");
      setOrDelete("periodo", merged.periodo, "");
      setOrDelete("guests", merged.guests, "");
      setOrDelete("status", merged.status, "");
      setOrDelete("sortKey", merged.sortKey, "date");
      setOrDelete("sortDir", merged.sortDir, "desc");
      setOrDelete("page", merged.page, 1);
      return next;
    }, { replace: true });
  }, [setParams, state]);

  const reset = useCallback(() => {
    setParams(new URLSearchParams(), { replace: true });
  }, [setParams]);

  const dateLabel = useMemo(() => {
    if (state.dateMode === "next7") return "Próximos 7 dias";
    if (state.dateMode === "thisWeek") return `Semana atual (${formatDateToDisplay(state.date)})`;
    if (state.date) return formatDateToDisplay(state.date);
    return "";
  }, [state.dateMode, state.date]);

  const setQuickDate = useCallback((type: "today" | "tomorrow" | "all" | "thisWeek" | "next7Days") => {
    switch (type) {
      case "today": {
        update({ date: todayLocalISO(), dateMode: "exact" });
        break;
      }
      case "tomorrow": {
        const t = new Date();
        t.setDate(t.getDate() + 1);
        update({ date: toLocalISO(t), dateMode: "exact" });
        break;
      }
      case "thisWeek": {
        const today = new Date();
        const start = new Date(today);
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        update({ date: toLocalISO(start), dateMode: "thisWeek" });
        break;
      }
      case "next7Days": {
        update({ date: todayLocalISO(), dateMode: "next7" });
        break;
      }
      case "all":
      default: {
        update({ date: "", dateMode: "" });
        break;
      }
    }
  }, [update]);

  const matches = useCallback((r: Reservation): boolean => {
    const term = state.search.trim().toLowerCase();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.phone.includes(state.search);

    let matchesDate = true;
    if (state.dateMode === "next7") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 7);
      const d = parseLocalDate(r.date);
      matchesDate = d >= start && d <= end;
    } else if (state.dateMode === "thisWeek") {
      const today = new Date();
      const start = new Date(today);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1);
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      const d = parseLocalDate(r.date);
      matchesDate = d >= start && d <= end;
    } else if (state.dateMode === "exact" && state.date) {
      matchesDate = r.date === state.date;
    }

    const matchesPeriodo = !state.periodo || r.periodo === state.periodo;
    const matchesGuests =
      !state.guests ||
      (state.guests === "6" ? r.guests >= 6 : r.guests.toString() === state.guests);
    const matchesStatus = !state.status || (r.status ?? "pending") === state.status;

    return matchesSearch && matchesDate && matchesPeriodo && matchesGuests && matchesStatus;
  }, [state]);

  return { state, update, reset, setQuickDate, dateLabel, matches };
};
