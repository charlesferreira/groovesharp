# Configuração do Supabase

O app funciona em **dois modos**:

- **Local (sem backend):** sem variáveis de ambiente, roda como antes — dados só no
  aparelho, sem contas. É o modo atual da produção.
- **Com backend:** definindo as variáveis abaixo, liga contas, sync e bandas.

## Desenvolvimento local (Supabase no Docker)

Já configurado no repo (`supabase/`). Com Docker rodando:

```bash
npx supabase start      # sobe Postgres + Auth + Realtime e aplica as migrations
npx supabase status     # mostra API URL e a anon key locais
```

Crie um `.env.local` (veja `.env.example`) com os valores que o `status` mostrar:

```
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key local>
```

Para resetar o banco local e reaplicar migrations: `npx supabase db reset`.

## Produção (nuvem) — o que o Charles precisa fazer

1. **Criar o projeto** em https://supabase.com (região mais perto, ex.: São Paulo).
2. **Aplicar o schema:**
   ```bash
   npx supabase link --project-ref <ref-do-projeto>
   npx supabase db push
   ```
3. **Login com Google (OAuth):**
   - No Google Cloud Console: criar credenciais **OAuth 2.0 Client ID** (tipo Web).
   - Em *Authorized redirect URIs*, colar a callback do Supabase:
     `https://<ref>.supabase.co/auth/v1/callback`.
   - No painel do Supabase → *Authentication → Providers → Google*: colar o Client ID e
     Secret e ativar.
   - Em *Authentication → URL Configuration*: definir *Site URL* e *Redirect URLs*
     incluindo `https://charlesferreira.github.io/groovesharp/`.
4. **Variáveis no deploy (GitHub Actions):** adicionar em *Settings → Secrets and
   variables → Actions → Variables* do repositório:
   - `VITE_SUPABASE_URL` = `https://<ref>.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = anon key do projeto (é publicável, pode ir no bundle).

   O workflow de deploy passa essas variáveis no passo de build.

> A **anon key** é pública por design (o que protege os dados é a RLS). A **service_role
> key** NUNCA vai pro frontend nem pro repositório.
