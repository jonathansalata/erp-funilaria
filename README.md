# ERP Funilaria

Sistema de gestão para funilaria, pintura e estética automotiva — clientes, veículos, agenda,
orçamentos, ordens de serviço, financeiro, relatórios e configurações centralizadas.

> **Status**: Fase 0 — Fundação do projeto. Nenhuma regra de negócio foi implementada ainda.
> Veja o roadmap completo em [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), seção 11.

## Stack

| Camada      | Tecnologia                                                   |
| ----------- | ------------------------------------------------------------ |
| Framework   | Next.js 16 (App Router, Turbopack, `src/`)                   |
| Linguagem   | TypeScript (strict)                                          |
| UI          | Tailwind CSS v4 + Shadcn/UI (Radix)                          |
| Tema        | `next-themes` (claro/escuro/sistema)                         |
| Formulários | React Hook Form + Zod                                        |
| Backend     | Supabase (Auth, Postgres, Storage, Realtime, Edge Functions) |
| Hospedagem  | Vercel                                                       |
| Lint/Format | ESLint 9 (flat config) + Prettier + Husky/lint-staged        |

## Documentação

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — arquitetura completa (frontend, backend, banco
  de dados, RBAC, roadmap).
- [SETUP.md](SETUP.md) — guia de configuração do ambiente local.
- [DATABASE.md](DATABASE.md) — convenções de banco de dados e migrations.
- [DECISIONS.md](DECISIONS.md) — decisões e ajustes tomados durante a implementação.

## Como rodar

```bash
npm install
cp .env.local.example .env.local   # preencher com as credenciais do Supabase
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

## Scripts disponíveis

| Script                 | Descrição                                        |
| ---------------------- | ------------------------------------------------ |
| `npm run dev`          | Inicia o servidor de desenvolvimento (Turbopack) |
| `npm run build`        | Build de produção                                |
| `npm run start`        | Inicia o servidor de produção                    |
| `npm run lint`         | Executa o ESLint                                 |
| `npm run format`       | Formata o projeto com Prettier                   |
| `npm run format:check` | Verifica a formatação sem alterar arquivos       |
| `npm run typecheck`    | Verifica os tipos TypeScript sem gerar saída     |

## Estrutura do projeto

A estrutura de pastas segue exatamente o definido em
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#3-estrutura-de-pastas), incluindo as rotas do App
Router (`(auth)`, `(dashboard)`, `api`), componentes (`ui`, `layout`, `shared`, `forms`,
`modules`), camadas de acesso ao Supabase (`lib/supabase`), hooks, stores e migrations
(`supabase/migrations`).
