# Anexar imagem às reservas (admin)

Permitir que admins anexem **uma imagem** por reserva nas 3 unidades (Tróia, Cabo Frio, São Pedro), visível nos detalhes e editável no formulário.

## 1. Banco de dados

Adicionar coluna `image_url text` nas 3 tabelas:
- `public.reservations`
- `public.reservations_cabofrio`
- `public.reservations_saopedro`

Migração simples com `ALTER TABLE ... ADD COLUMN image_url text`.

## 2. Storage

Reaproveitar o bucket existente **`imagens`** (público), usando o prefixo `reservas/{bar}/{reservation_id}-{timestamp}.{ext}`.

Políticas RLS em `storage.objects` para o prefixo `reservas/`:
- **SELECT**: público (bucket já é público).
- **INSERT / UPDATE / DELETE**: somente usuários com role `admin` (via `has_role(auth.uid(), 'admin')`).

## 3. Componente de upload

Novo componente `src/components/admin/ImageUploadField.tsx`:
- Input file (accept=image/*, máx 5MB, valida tipo).
- Preview da imagem atual com botão "Remover" e "Trocar".
- Upload via `supabase.storage.from('imagens').upload(...)`, retorna `publicUrl`.
- Estado de loading + toasts de erro/sucesso.

## 4. Integração nos formulários admin

- **`AdminReservationForm.tsx`** (Tróia): adicionar campo `image_url` no state e renderizar `<ImageUploadField>`.
- **`AdminBarReservationForm.tsx`** (Cabo Frio / São Pedro): mesmo tratamento.
- Ao salvar, persistir `image_url` junto com os demais campos.
- Ao excluir/trocar imagem, remover o arquivo antigo do storage (best-effort).

## 5. Exibição

- **`AdminReservationDetails.tsx`** (Sheet do Tróia): nova seção "Anexo" com thumbnail clicável que abre em nova aba.
- Tabelas admin de Cabo Frio/São Pedro: pequeno ícone de clipe (📎) na linha quando houver anexo, abrindo a imagem em lightbox simples (ou nova aba).

## 6. Tipos

Atualizar as interfaces `Reservation` e `BarReservation` nos hooks (`useReservations.ts`, `useBarReservations.ts`) para incluir `image_url?: string | null`.

## Detalhes técnicos

- Validação client-side: tipo MIME (`image/jpeg|png|webp`), tamanho ≤ 5MB.
- Nome do arquivo: `reservas/{bar}/{uuid}.{ext}` para evitar colisão e facilitar cleanup.
- Como o bucket é público, qualquer pessoa com o link vê a imagem — se no futuro houver comprovantes sensíveis, migrar para bucket privado com URLs assinadas.
- `image_url` é nullable, não quebra reservas existentes.
- Sem impacto nos formulários públicos dos clientes.

## Fora de escopo

- Upload pelo cliente no formulário público.
- Múltiplas imagens / galeria.
- Compressão/resize automático (pode entrar depois se necessário).
