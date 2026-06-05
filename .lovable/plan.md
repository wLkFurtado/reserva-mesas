## Objetivo
Registrar quem fez cada ação em uma reserva (criou, mudou status, excluiu) e exibir no histórico sem poluir o layout.

## Como ficar discreto
Reaproveitar o painel "Histórico de Alterações" que já existe no Sheet de detalhes (AdminReservationDetails). Não adicionar nada novo na tabela ou na lista. Apenas cada linha do histórico passa a mostrar o email do admin responsável em texto pequeno, abaixo da descrição.

Exemplo visual de cada item:
```
05/06/2026 14:32
Alterado de Pendente para Confirmada
por admin@troia.com  ← texto muted, xs
```

Para "excluída", como a reserva some, o log de exclusão não é visível no Sheet. Adicionamos uma aba/seção opcional "Reservas excluídas (últimos 30 dias)" só se você quiser — por padrão deixo escondido para não poluir.

## Mudanças no banco (migration)
Tabela `reservation_logs`:
- Adicionar coluna `changed_by uuid` (referencia auth.users.id, nullable)
- Adicionar coluna `changed_by_email text` (snapshot do email, sobrevive se usuário for removido)
- Adicionar coluna `action text` com valores: `created`, `status_changed`, `deleted`
- Permitir INSERT por admins (hoje só tem SELECT e DELETE)

Trigger `log_reservation_status_change` atualizado:
- Em INSERT: cria log com action='created', new_status do registro
- Em UPDATE de status: action='status_changed' (comportamento atual)
- Em DELETE: action='deleted', old_status preservado
- Em todos os casos, captura `auth.uid()` e o email via `auth.jwt() ->> 'email'`

Mesmo tratamento replicado nas tabelas `reservations_cabofrio` e `reservations_saopedro` (que hoje não têm logs). Criar tabelas `reservation_logs_cabofrio` e `reservation_logs_saopedro` espelhando a estrutura, ou unificar tudo numa tabela só com coluna `bar` — vou usar **uma tabela única** `reservation_logs` com colunas `bar text` e `reservation_id` solto (sem FK rígida, porque aponta para 3 tabelas diferentes). Isso simplifica consulta e UI.

## Mudanças no frontend
- `useReservations.ts` / `useBarReservations.ts`: nada muda nas mutations — o trigger captura tudo no banco.
- `useReservationLogs`: passar a aceitar `bar` e filtrar por bar+reservation_id.
- `AdminReservationDetails.tsx` (Tróia) e equivalente do bar panel: renderizar nova estrutura do log:
  - "Criada por admin@troia.com"
  - "Alterada de Pendente para Confirmada por admin@troia.com"
  - Email em `text-xs text-muted-foreground` para não pesar.

## Detalhes técnicos
- O trigger usa `SECURITY INVOKER` (não DEFINER) para que `auth.uid()` e `auth.jwt()` reflitam o admin logado, não o owner da função.
- Política nova de INSERT em `reservation_logs`: permitir só quando o admin estiver autenticado (`has_role(auth.uid(),'admin')`) — mesmo padrão das outras políticas.
- Log de exclusão é gravado pelo trigger BEFORE DELETE para garantir que conseguimos preservar `old_status`.
- Migration única que: (1) adiciona colunas em reservation_logs, (2) adiciona política de INSERT, (3) reescreve trigger e instala em INSERT/UPDATE/DELETE das 3 tabelas de reservas.

## Pergunta rápida
Quer que reservas excluídas continuem aparecendo em algum lugar (uma seção "Excluídas" colapsada na lista) ou pode ficar só registrado no banco para auditoria? Por padrão vou apenas registrar — sem UI nova — para manter limpo.