

# Otimização do Painel Admin

Análise do `AdminDashboard.tsx` atual (961 linhas, monolítico) revelou pontos de UX, performance e organização que dá pra atacar. Proponho **4 frentes de melhoria** ordenadas por impacto. Você escolhe quais entrar.

## Frente 1 — UX e densidade visual (alto impacto, baixo risco)

**Problema:** estatísticas pobres (só 3 cards), filtros ocupam muito espaço, tabela perde contexto de capacidade, emoji "📋" no empty state contradiz a identidade clean.

**Mudanças:**
- **KPIs mais ricos:** trocar os 3 cards atuais por 5 cards: Reservas hoje, Pessoas hoje, **Ocupação hoje (X/110 + barra de progresso)**, Próximos 7 dias, Pendentes aguardando confirmação.
- **Indicador de capacidade do dia filtrado:** quando há filtro de data específica, mostrar barra visual `Tarde XX/110 · Noite XX/110` no topo da tabela (consome `get_reservations_status_by_period`).
- **Empty state limpo:** remover emoji, usar ícone `CalendarX` da lucide no estilo dark/gold.
- **Filtros colapsáveis:** envolver bloco de filtros num `Collapsible` (aberto por padrão no desktop, fechado no mobile) pra liberar espaço vertical.
- **Substituir `<select>` nativos** por `Select` shadcn (consistência visual com o resto).

## Frente 2 — Tabela e ações (médio impacto)

**Problema:** linhas densas demais, ações destrutivas usam `confirm()` nativo, sem ações em lote, sem visualização detalhada.

**Mudanças:**
- **AlertDialog** no lugar de `window.confirm` para exclusão (estilo consistente).
- **Drawer/Sheet de detalhes:** clicar na linha abre painel lateral com info completa + histórico (created_at formatado, telefone clicável `tel:`, email clicável `mailto:`, botão "Copiar contato").
- **Seleção múltipla** com checkbox por linha → barra flutuante com ações em lote (Confirmar todas / Cancelar todas / Exportar selecionadas).
- **Badge de período** com cores (Tarde = âmbar suave, Noite = índigo suave) pra escaneamento rápido.
- **Highlight de hoje:** linhas com `date === hoje` recebem leve destaque (border-l dourado).
- **Coluna "Criada em"** opcional (toggle de colunas via dropdown).

## Frente 3 — Visão Calendário (médio impacto, novo recurso)

**Problema:** painel só tem visão lista. Ver volume mensal exige filtrar dia a dia.

**Mudanças:**
- Adicionar **Tabs** no topo: `Lista` | `Calendário`.
- View Calendário: grid mensal com cada dia mostrando `total/110` e mini-barra de ocupação. Cores: verde (<50%), âmbar (50-85%), vermelho (>85%).
- Clicar num dia → aplica filtro de data e troca pra Lista.
- Componente novo: `src/components/admin/ReservationCalendar.tsx`.

## Frente 4 — Refatoração e qualidade de código (técnico)

**Problema:** `AdminDashboard.tsx` tem 961 linhas, mistura layout, lógica de filtro, formulário e tabela.

**Mudanças:**
- Quebrar em sub-componentes em `src/components/admin/`:
  - `AdminHeader.tsx` (header + logout)
  - `AdminStatsCards.tsx` (KPIs)
  - `AdminFilters.tsx` (busca + filtros)
  - `AdminReservationTable.tsx` (tabela + paginação)
  - `AdminReservationForm.tsx` (form de criar/editar — pode virar `Dialog` em vez de card inline)
  - `AdminReservationDetails.tsx` (Sheet de detalhes)
- Hook `useAdminFilters.ts` centraliza estado dos filtros + URL sync (`?date=...&status=...`) → filtros persistem ao recarregar e podem ser compartilhados via link.
- Form de criar/editar vira **Dialog modal** em vez de card empurrando a tabela pra baixo.

## Detalhes técnicos

- Sem novas dependências (`Collapsible`, `Sheet`, `AlertDialog`, `Tabs`, `Checkbox`, `Progress` já existem em `src/components/ui/`).
- Frente 1 usa `useReservationStatusByPeriod` (já existe em `useReservations.ts`).
- Frente 3 calcula ocupação mensal client-side a partir de `reservations` já carregadas — sem nova RPC necessária.
- URL sync na Frente 4 via `useSearchParams` do `react-router-dom`.
- Mantém Realtime e React Query existentes intactos.

## Ordem sugerida

**1 → 2 → 4 → 3** (UX primeiro pra ganho visível, refatoração antes do novo recurso pesado).

Cada frente é independente e entregável separadamente. Me diga **quais frentes quer** (ou todas) e eu implemento.

