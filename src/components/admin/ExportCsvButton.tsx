import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Reservation } from "@/hooks/useReservations";
import { formatDateToDisplay } from "@/lib/date-utils";

interface ExportCsvButtonProps {
  reservations: Reservation[];
  filename?: string;
}

const escapeCsv = (value: unknown): string => {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const periodoLabel = (p: string) =>
  p === "tarde" ? "Tarde" : p === "noite" ? "Noite" : p;

const statusLabel = (s?: string | null) => {
  switch (s) {
    case "confirmed":
      return "Confirmada";
    case "cancelled":
      return "Cancelada";
    case "pending":
    default:
      return "Pendente";
  }
};

export const ExportCsvButton = ({
  reservations,
  filename = "reservas.csv",
}: ExportCsvButtonProps) => {
  const handleExport = () => {
    const headers = [
      "Nome",
      "Email",
      "Telefone",
      "Pessoas",
      "Data",
      "Periodo",
      "Status",
      "Criada em",
    ];
    const rows = reservations.map((r) => [
      r.name,
      r.email,
      r.phone,
      r.guests,
      formatDateToDisplay(r.date),
      periodoLabel(r.periodo),
      statusLabel((r as any).status),
      new Date(r.created_at).toLocaleString("pt-BR"),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    // BOM para Excel reconhecer UTF-8
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={reservations.length === 0}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      Exportar CSV
    </Button>
  );
};
