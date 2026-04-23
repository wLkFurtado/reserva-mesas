import { z } from "zod";

const phoneRegex = /^\(\d{2}\) \d{4,5}-\d{4}$/;

export const reservationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(120, "Nome muito longo"),
  email: z
    .string()
    .trim()
    .email("Email inválido")
    .max(180, "Email muito longo"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "Telefone deve estar no formato (XX) XXXXX-XXXX"),
  guests: z
    .number({ invalid_type_error: "Informe o número de pessoas" })
    .int("Número inválido")
    .min(1, "Mínimo 1 pessoa")
    .max(110, "Máximo 110 pessoas"),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
  periodo: z.enum(["tarde", "noite"], {
    errorMap: () => ({ message: "Selecione um período válido" }),
  }),
});

export type ReservationFormValues = z.infer<typeof reservationSchema>;

/** Schema mais flexível para o admin (aceita qualquer período cadastrado). */
export const reservationAdminSchema = reservationSchema.extend({
  periodo: z.string().min(1, "Período é obrigatório"),
  guests: z
    .number({ invalid_type_error: "Informe o número de pessoas" })
    .int()
    .min(1, "Mínimo 1 pessoa")
    .max(110, "Máximo 110 pessoas"),
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
});

export type ReservationAdminValues = z.infer<typeof reservationAdminSchema>;
