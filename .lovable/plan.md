

# Plano de melhorias do sistema de reservas Tróia

Aprovado pelo usuário, sem confirmação por e-mail ao cliente. Execução em 5 fases.

## Fase 1 — Segurança (urgente)

- Apagar `src/integrations/supabase/admin-client.ts`, `src/lib/supabase-admin.ts`, `SOLUCAO_RLS.md` e a variável `VITE_SUPABASE_SERVICE_ROLE_KEY` do `.env` / `.env.example`.
- Migration SQL:
  - Criar enum `app_role` (`admin`, `user`).
  - Criar tabela `public.user_roles (id, user_id, role, unique(user_id, role))` com RLS habilitado.
  - Criar função `public.has_role(_user_id uuid, _role app_role)` SECURITY DEFINER.
  - Inserir `('00000000-0000-0000-0000-000000000001', 'admin')` em `user_roles`.
  - Reescrever policies de `reservations`: INSERT público permitido; SELECT/UPDATE/DELETE só com `has_role(auth.uid(),'admin')`.
  - Remover dependência de `profiles.role` nas policies.
- Atualizar `useAuth.tsx` para checar admin via `user_roles` (consulta `has_role` ou select em `user_roles`).
- Avisar o usuário para **rotacionar a service_role key** no painel Supabase após o deploy.

## Fase 2 — Bugs e limpeza

- Criar `src/lib/date-utils.ts` com `parseLocalDate`, `toLocalISO`, `formatDateToDisplay`, `formatDateToISO`. Importar em `AdminDashboard.tsx` e `ReservationForm.tsx`. Resolve o erro `Cannot access 'parseLocalDate' before initialization`.
- Substituir os `<Input type="text">` de data no admin (filtro + formulário) por `Calendar` + `Popover` (DatePicker visual).
- Adicionar `min={today}` no formulário admin.
- Aplicar máscara `(XX) XXXXX-XXXX` no campo telefone (público + admin) via util simples.
- Regenerar tipos do Supabase para remover os `@ts-ignore` em torno de `get_reservations_status`.

## Fase 3 — React Query + qualidade

- Migrar `fetchReservations` (admin) e `get_reservations_status` (formulário) para `useQuery`.
- Mutations (`create`, `update`, `delete` reserva) via `useMutation` com `invalidateQueries`.
- Adicionar canal Realtime do Supabase na lista do admin: ao receber `INSERT/UPDATE/DELETE` em `reservations`, invalida a query.
- Validação dos formulários com **Zod + react-hook-form** (substitui a cascata `if + toast`).

## Fase 4 — UX do formulário público

- Skeleton de carregamento da disponibilidade (substitui texto "Carregando...").
- Mostrar disponibilidade **por período** (tarde/noite) em vez de só total do dia. Requer ajustar `get_reservations_status` para retornar breakdown por período (ou nova função `get_reservations_status_by_period`).
- Marcar opções "Tarde" / "Noite" como desabilitadas quando lotadas.
- Manter botão `disabled` durante o `navigate` pós-submit.

## Fase 5 — Painel admin

- Campo `status` em `reservations` (`confirmada` default, `cancelada`, `compareceu`, `no_show`) + UI para alterar.
- Botão **Exportar CSV** das reservas filtradas.
- **Visão calendário mensal** (heatmap por volume) usando o `Calendar` shadcn com modificadores customizados.
- Ordenação clicável nas colunas (data, nome, pessoas).
- Paginação server-side (page size 50) usando `range()` do Supabase.

## Detalhes técnicos relevantes

- Arquivos novos: `src/lib/date-utils.ts`, `src/lib/phone-mask.ts`, `src/hooks/useReservations.ts` (React Query), `src/components/admin/ReservationCalendar.tsx`, `src/components/admin/ExportCsvButton.tsx`.
- Migrations novas: `user_roles` + RLS, `reservations.status`, possível ajuste em `get_reservations_status`.
- Sem novas dependências externas (Zod, React Query, date-fns já estão instalados).
- Edge functions: nenhuma nesta rodada (sem e-mail/lembretes automáticos).

## Ordem de execução sugerida

1 → 2 → 3 → 4 → 5. Cada fase é independente e entregável separadamente. Posso pausar ao fim de qualquer fase para você validar antes da próxima.

