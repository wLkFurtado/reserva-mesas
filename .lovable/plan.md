## Objective
Remove the "Receita Estimada" (Estimated Revenue) card from the admin dashboard stats.

## File
- `src/components/admin/AdminStatsCards.tsx`

## Changes
1. Remove the last `<Card>` block (lines 78-89) containing "Receita Estimada".
2. Remove the `TrendingUp` icon import (line 3) since it will no longer be used.
3. Remove `estimatedRevenue` from the `stats` return object (line 46) since it becomes dead code.
4. Optionally adjust the grid columns if needed (`lg:grid-cols-5` → `lg:grid-cols-4` since we'll have 4 cards instead of 5).