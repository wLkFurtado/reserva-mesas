/**
 * Aplica máscara brasileira a um telefone:
 *   "11987654321" -> "(11) 98765-4321"
 *   "1133334444"  -> "(11) 3333-4444"
 * Aceita entrada parcial e ignora caracteres não numéricos.
 */
export const maskPhone = (value: string): string => {
  const digits = (value || "").replace(/\D/g, "").slice(0, 11);

  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

/** Retorna apenas os dígitos do telefone. */
export const unmaskPhone = (value: string): string => (value || "").replace(/\D/g, "");
