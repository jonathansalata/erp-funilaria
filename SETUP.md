# Setup do Ambiente Local

Este guia descreve como preparar o ambiente para rodar o ERP Funilaria localmente.

## Pré-requisitos

- Node.js 20+ e npm
- Git
- Conta no [Supabase](https://supabase.com)
- (Opcional, para banco local) [Docker](https://www.docker.com/) — necessário para
  `npx supabase start`

## 1. Instalar dependências

```bash
npm install
```

Isso também registra os hooks do Husky (`npm run prepare`).

## 2. Variáveis de ambiente

Copie o arquivo de exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp .env.local.example .env.local
```

| Variável                        | Onde encontrar                                    | Uso                                                                                       |
| ------------------------------- | ------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase Dashboard → Project Settings → API       | Cliente browser e servidor (seguro expor)                                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API       | Cliente browser e servidor (seguro expor)                                                 |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase Dashboard → Project Settings → API       | **Apenas server-side** (`src/lib/supabase/admin.ts`). Nunca commitar nem expor ao client. |
| `NEXT_PUBLIC_APP_URL`           | URL da aplicação (`http://localhost:3000` em dev) | Usado em e-mails e links de redirecionamento do Auth                                      |

> `.env.local` está no `.gitignore` e nunca deve ser commitado.

## 3. Projeto Supabase

### Opção A — Projeto remoto (recomendado para começar)

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Copie a URL e as chaves para `.env.local` (passo 2).
3. As migrations em `supabase/migrations/` ainda são placeholders (Fase 0). Elas serão
   implementadas a partir da Fase 1 e aplicadas com:

   ```bash
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```

### Opção B — Stack local com Docker

```bash
npx supabase start
```

Isso sobe Postgres, Auth, Storage, Studio etc. localmente (ver `supabase/config.toml`). Use as
URLs/chaves impressas no terminal para preencher `.env.local`.

## 4. Rodar a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## 5. Qualidade de código

Antes de commitar, o Husky executa `lint-staged` automaticamente (ESLint + Prettier nos arquivos
staged). Para rodar manualmente em todo o projeto:

```bash
npm run lint
npm run format
npm run typecheck
npm run build
```

## Próximos passos

Esta é a Fase 0 (fundação do projeto). As regras de negócio, autenticação multi-tenant, RBAC e
módulos do ERP serão implementados nas fases seguintes — ver
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), seção 11 (Roadmap).
