# Generous

Open-source framework built with Turborepo.

## Stack

- **Monorepo**: Turborepo
- **Package Manager**: pnpm
- **Node Version**: 22 LTS
- **Framework**: Next.js 15 (App Router)
- **API**: tRPC + SWR
- **Database**: Drizzle ORM + PostgreSQL
- **Auth**: Better Auth
- **Linting/Formatting**: Biome
- **Testing**: Vitest + Playwright

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 9+
- PostgreSQL database

### Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy environment variables:

```bash
cp apps/generous/.env.example apps/generous/.env
```

3. Update `.env` with your database URL and auth secret.

4. Generate database schema:

```bash
pnpm db:generate
pnpm db:push
```

5. Start the development server:

```bash
pnpm dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build all packages |
| `pnpm test` | Run unit tests |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm lint` | Lint all packages |
| `pnpm format` | Format all files |
| `pnpm db:generate` | Generate database migrations |
| `pnpm db:push` | Push schema to database |

## Structure

```
generous/
├── apps/
│   └── generous/         # Next.js application
├── packages/
│   ├── ui/               # Shared UI components
│   ├── config-typescript/# Shared TypeScript config
│   └── config-biome/     # Shared Biome config
└── turbo.json            # Turborepo configuration
```

## License

MIT
