/**
 * Helpers de data — todos baseados em horário LOCAL para evitar
 * mudança de dia por causa de fuso horário (datas vêm como YYYY-MM-DD).
 */

/** Parseia "YYYY-MM-DD" como meia-noite local (não UTC). */
export const parseLocalDate = (isoDate: string): Date => {
  return new Date(`${isoDate}T00:00:00`);
};

/** Converte um Date para "YYYY-MM-DD" usando o fuso local. */
export const toLocalISO = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** "YYYY-MM-DD" -> "DD/MM/YYYY". */
export const formatDateToDisplay = (isoDate: string): string => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return "";
  return `${day}/${month}/${year}`;
};

/** "DD/MM/YYYY" (ou "DD/MM/YY") -> "YYYY-MM-DD". Retorna "" se inválido. */
export const formatDateToISO = (displayDate: string): string => {
  if (!displayDate) return "";
  const cleaned = displayDate.trim();
  if (cleaned.length < 8) return "";

  const [day, month, year] = cleaned.split("/");
  if (!day || !month || !year) return "";

  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  let yearNum = parseInt(year, 10);
  if (year.length === 2) yearNum = 2000 + yearNum;

  if (isNaN(dayNum) || isNaN(monthNum) || isNaN(yearNum)) return "";
  if (dayNum < 1 || dayNum > 31 || monthNum < 1 || monthNum > 12 || yearNum < 2000) return "";

  return `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
};

/** Hoje em "YYYY-MM-DD" no fuso local. */
export const todayLocalISO = (): string => toLocalISO(new Date());
