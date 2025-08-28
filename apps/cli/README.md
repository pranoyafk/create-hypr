# create-hypr

A CLI tool to scaffold a new Hypr Stack project with modern full-stack monorepo.

---
## 🚀 Getting Started

Pick your package manager and run:

```bash
# bun
bun create hypr my-app

# pnpm
pnpm create hypr@latest my-app
```
The CLI will ask you a couple of questions (frontend + database), and then you’re ready to go.


## 🧩 What You Get
The generated project is a Turborepo monorepo with a clean structure:

```bash
my-app/
├── apps/
│   ├── web/        # Frontend (TanStack Router CSR or TanStack Start SSR)
│   └── server/     # Backend (Hono by default, but swap it if you like)
├── packages/
│   ├── db/         # Database client & migrations
│   ├── trpc/       # tRPC setup (shared between web & server)
│   ├── auth/       # Better Auth config
│   ├── env/        # t3 env for env validation
│   └── ui/         # Shadcn UI components
└── turbo.json      # Turborepo config
```
The defaults are opinionated so you can hit the ground running:
- **Frontend**: TanStack Router (CSR) or TanStack Start (SSR)
- **Backend**: Hono (swappable for Express/Fastify/etc.)
- **Database**: SQLite / Postgres / MySQL
- **UI**: Shadcn UI
- **Auth**: Better Auth

Everything is set up to work out of the box but nothing is locked in. Edit, swap, or extend as you like.

## 🎛 CLI Prompts
When you run `create-hypr`, you’ll choose:

- **Frontend** → Tanstack Router or Tanstack Start
- **Database** → sqlite, postgres, or mysql

That’s it. No overwhelming setup wizard, just enough choice to get moving fast.

## 💡 Why Hypr Stack?
The goal is simple: give you a modern full-stack foundation that just works.
You don’t waste hours wiring up tRPC, auth, db clients, routing, and UI, you start coding your app right away.

Think of it as a T3-style stack, but built on TanStack, Hono, and Turborepo.

## 🛠 Contributing

Clone and run locally:
```bash
git clone https://github.com/pranoyafk/create-hypr.git
cd create-hypr
bun install
bun build
```

Test the CLI:
```bash
node ./apps/cli/dist/index.js
```
## 🤝 Contribute
Got an idea to improve the stack or CLI? PRs and discussions are always welcome.
