-- Adiciona campo de mensagem/ocasião especial à tabela de reservas
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS message TEXT;

COMMENT ON COLUMN public.reservations.message IS
  'Mensagem opcional do cliente: ocasião especial, intolerância alimentar, pedido especial, etc.';
