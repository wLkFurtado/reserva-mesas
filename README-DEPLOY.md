# Guia de Deploy - Sistema de Reserva de Mesas

## Pré-requisitos

- Projeto Supabase configurado e funcionando
- Variáveis de ambiente configuradas
- Código testado localmente

## Opções de Deploy

### 1. Vercel (Recomendado)

**Vantagens:**
- Deploy automático via Git
- CDN global
- Otimizado para React/Vite
- SSL automático
- Preview deployments

**Passos:**

1. **Instalar Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login na Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Configurar variáveis de ambiente:**
   - Acesse o dashboard da Vercel
   - Vá em Settings > Environment Variables
   - Adicione:
     - `VITE_SUPABASE_PROJECT_ID`
     - `VITE_SUPABASE_PUBLISHABLE_KEY`
     - `VITE_SUPABASE_URL`

5. **Deploy para produção:**
   ```bash
   vercel --prod
   ```

### 2. Netlify

**Vantagens:**
- Interface amigável
- Deploy via drag & drop
- Formulários integrados
- Edge functions

**Passos:**

1. **Build local:**
   ```bash
   npm run build
   ```

2. **Deploy via CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=dist
   ```

3. **Ou via interface web:**
   - Acesse netlify.com
   - Arraste a pasta `dist` para o deploy
   - Configure as variáveis de ambiente no dashboard

### 3. GitHub Pages

**Limitações:** Apenas sites estáticos, sem variáveis de ambiente server-side

**Passos:**

1. **Instalar gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Adicionar script no package.json:**
   ```json
   {
     "scripts": {
       "deploy": "npm run build && gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

## Configuração do Supabase para Produção

### 1. Verificar RLS (Row Level Security)

⚠️ **IMPORTANTE:** A tabela `scheduled_reminders` está sem RLS habilitado.

```sql
-- Habilitar RLS na tabela scheduled_reminders
ALTER TABLE public.scheduled_reminders ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso (exemplo)
CREATE POLICY "Allow read access to scheduled_reminders" ON public.scheduled_reminders
FOR SELECT USING (true);
```

### 2. Configurar domínio personalizado

1. Acesse o dashboard do Supabase
2. Vá em Settings > API
3. Adicione o domínio de produção em "Site URL"
4. Configure redirect URLs se necessário

### 3. Verificar limites de uso

- Monitore o uso de requests
- Configure alertas de limite
- Considere upgrade do plano se necessário

## Scripts de Build

### Desenvolvimento
```bash
npm run dev
```

### Build de produção
```bash
npm run build
```

### Preview local do build
```bash
npm run preview
```

## Checklist de Deploy

- [ ] Variáveis de ambiente configuradas
- [ ] Build funcionando localmente
- [ ] RLS habilitado no Supabase
- [ ] Domínio configurado no Supabase
- [ ] SSL configurado
- [ ] Testes de funcionalidade em produção
- [ ] Monitoramento configurado

## Troubleshooting

### Erro de CORS
- Verificar se o domínio está configurado no Supabase
- Conferir as URLs de redirect

### Variáveis de ambiente não carregam
- Verificar se começam com `VITE_`
- Confirmar configuração na plataforma de deploy
- Fazer rebuild após alterar variáveis

### Build falha
- Verificar se todas as dependências estão instaladas
- Conferir se não há erros de TypeScript
- Verificar logs de build na plataforma

## Monitoramento

### Métricas importantes:
- Tempo de carregamento
- Taxa de erro
- Uso do Supabase
- Conversão de reservas

### Ferramentas recomendadas:
- Vercel Analytics
- Supabase Dashboard
- Google Analytics
- Sentry (para error tracking)