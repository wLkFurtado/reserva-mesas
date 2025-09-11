-- Migração para alterar a coluna reservation_time para periodo
-- Remove a coluna de horário específico e adiciona campo de período (tarde/noite)

-- 1) Adicionar nova coluna periodo
ALTER TABLE public.reservations 
ADD COLUMN periodo text;

-- 2) Migrar dados existentes (se houver)
-- Converte horários existentes para períodos
UPDATE public.reservations 
SET periodo = CASE 
  WHEN EXTRACT(HOUR FROM reservation_time) < 18 THEN 'tarde'
  ELSE 'noite'
END
WHERE reservation_time IS NOT NULL;

-- 3) Adicionar constraint para validar valores do período
ALTER TABLE public.reservations 
ADD CONSTRAINT check_periodo 
CHECK (periodo IN ('tarde', 'noite'));

-- 4) Tornar a coluna periodo obrigatória
ALTER TABLE public.reservations 
ALTER COLUMN periodo SET NOT NULL;

-- 5) Remover a coluna reservation_time
ALTER TABLE public.reservations 
DROP COLUMN reservation_time;