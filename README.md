# Letsry Turborepo

This is a pnpm monorepo using Turborepo for task orchestration. It contains three apps (`admin`, `backend`, `frontend`) under `apps/*` and shared packages under `packages/*`. Turborepo intelligently caches build outputs, test results, and other task artifacts to speed up subsequent runs. Tasks are defined in `turbo.json` and run across all workspaces that have matching scripts.

## Package Management

### Install a package in a specific app

```bash
# Install in admin
pnpm add <package-name> --filter admin

# Install in backend
pnpm add <package-name> --filter backend

# Install in frontend
pnpm add <package-name> --filter frontend

# Install as dev dependency
pnpm add -D <package-name> --filter frontend
```

### Install a package in all apps

```bash
pnpm add <package-name> --filter "./apps/*"
```

### Install workspace dependencies

```bash
# Install all dependencies across the entire monorepo
pnpm install
```

## Running Tests

### Run tests for a specific app

```bash
# Backend tests
pnpm --filter backend test

# Backend E2E tests
pnpm --filter backend test:e2e

# Frontend tests (if test script exists)
pnpm --filter frontend test
```

### Run tests for all apps

```bash
# Run all test scripts across the monorepo
turbo run test

# Run E2E tests across all apps that have it
turbo run test:e2e
```

## Build and Dev Commands

### Development mode

```bash
# Run dev for all apps (admin on :3001, frontend on :3000, backend on :5000)
turbo run dev

# Run dev for a specific app
pnpm --filter admin dev
pnpm --filter backend dev
pnpm --filter frontend dev
```

### Build

```bash
# Build all apps
turbo run build

# Build a specific app
pnpm --filter admin build
pnpm --filter backend build
pnpm --filter frontend build

# Build with dependencies (e.g., build frontend and all packages it depends on)
turbo run build --filter=frontend...
```

### Production start

```bash
# Start all apps in production mode
turbo run start

# Start a specific app
pnpm --filter admin start
pnpm --filter backend start
pnpm --filter frontend start
```

### Other common tasks

```bash
# Lint all apps
turbo run lint

# Type check all apps
turbo run check-types
turbo run type-check

# Format code
pnpm format

# Generate GraphQL types (frontend only)
pnpm --filter frontend codegen
```

## Turborepo Caching

### What is cached

- **Build outputs**: `.next/**` (Next.js), `dist/**` (Nest.js), `src/gql/**` (codegen)
- **Test coverage**: `coverage/**`
- **Lint results**: No file outputs, but task completion is cached
- **Type checking**: No file outputs, but task completion is cached

### What is NOT cached

- `dev` - Development servers (marked as `persistent: true`)
- `start` - Production servers (marked as `persistent: true`)

### Where cache is stored

```bash
# Local cache location
./node_modules/.cache/turbo

# Remote cache (if configured)
# Turborepo can use Vercel Remote Cache or custom remote cache
```

### Force rebuild / clear cache

```bash
# Force rebuild (ignore cache for this run)
turbo run build --force

# Clear all Turborepo cache
turbo run build --force --no-cache

# Delete cache directory manually
rm -rf ./node_modules/.cache/turbo

# Clear cache for a specific task
turbo run build --force --filter=frontend
```

### Understanding cache hits

```bash
# Run with verbose output to see cache hits/misses
turbo run build --verbose

# See what would be cached without running
turbo run build --dry-run
```

## Workspace Structure

```
letsry-turborepo/
├── apps/
│   ├── admin/          # Next.js admin dashboard (port 3001)
│   ├── backend/        # Nest.js GraphQL API (port 5000)
│   └── frontend/       # Next.js customer-facing app (port 3000)
├── packages/
│   ├── eslint-config/  # Shared ESLint configuration
│   ├── typescript-config/ # Shared TypeScript configuration
│   └── ui/             # Shared React components
├── turbo.json          # Turborepo task configuration
└── pnpm-workspace.yaml # pnpm workspace configuration
```

## Common Workflows

### Adding a new app

1. Create the app under `apps/<app-name>`
2. Add a `package.json` with appropriate scripts
3. Run `pnpm install` from the root
4. Turborepo will automatically pick up tasks defined in `turbo.json`

### Debugging build issues

```bash
# Run build with full output (no cache)
turbo run build --force --verbose

# Run build for a single app with logs
pnpm --filter backend build

# Check what Turborepo would do
turbo run build --dry-run --graph
```

### Working with dependencies

```bash
# Update all dependencies
pnpm update -r

# Update a specific package across all workspaces
pnpm update <package-name> -r

# Check for outdated packages
pnpm outdated -r
```

## Environment Variables

Each app manages its own environment variables:

- `apps/admin/.env.local`
- `apps/backend/.env`
- `apps/frontend/.env.local`

Turborepo automatically invalidates cache when `.env*` files change (configured in `turbo.json`).

## Notes

- **Missing scripts are OK**: If an app doesn't have a script (e.g., `backend` has no `codegen`), Turborepo skips it automatically.
- **Parallel execution**: Turborepo runs tasks in parallel when possible, respecting `dependsOn` relationships.
- **Incremental builds**: Only apps with changed files are rebuilt (unless `--force` is used).
