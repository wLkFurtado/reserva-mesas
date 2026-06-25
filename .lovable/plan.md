## Problema

O upload de imagem falha com **"The database schema is invalid or incompatible"** (HTTP 400, code `DatabaseInvalidObjectDefinition`).

Causa raiz: a função `public.has_role(uuid, app_role)` está **sem `GRANT EXECUTE`** para os roles `anon`/`authenticated`/`service_role`. Como as policies de `storage.objects` (`"Admins can upload reservation images"` e `"Imagens admin insert"`) chamam `has_role(...)`, a avaliação da RLS quebra com *permission denied for function has_role*, e o storage-api converte esse erro em `DatabaseInvalidObjectDefinition`.

Confirmado por:
- `information_schema.routine_privileges` para `public.has_role` retornando vazio.
- Chamadas diretas à função pelo service falham com `42501: permission denied for function has_role`.

## Correção

Rodar uma migração curta restaurando o EXECUTE:

```sql
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role)
  TO anon, authenticated, service_role;
```

Sem mudanças no frontend — depois disso o upload no formulário de Cabo Frio / São Pedro / Tróia volta a funcionar e o painel admin continua abrindo normalmente (a leitura do role no React já depende dessa mesma função).

## Observação

Vou deixar uma nota na memória de segurança para que próximas varreduras não removam novamente o `EXECUTE` dessa função — ela é usada por policies de RLS e por código cliente autenticado, então precisa permanecer executável por `authenticated` (e, no caso, `anon` também, pra não quebrar a checagem inicial pré-login).
