# Prisma 7 Upgrade Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Upgrade from Prisma 5 to Prisma 7 with the new adapter-based architecture.

**Architecture:** Replace Rust query engine with pure JS/TS using better-sqlite3 adapter, centralize config in prisma.config.ts.

**Tech Stack:** Prisma 7, @prisma/adapter-better-sqlite3, TypeScript, Next.js

---

## Breaking Changes Summary

| Prisma 5                        | Prisma 7                        |
| ------------------------------- | ------------------------------- |
| `url` in schema.prisma          | Moved to `prisma.config.ts`     |
| `prisma.seed` in package.json   | Moved to `prisma.config.ts`     |
| `provider = "prisma-client-js"` | `provider = "prisma-client"`    |
| Client in node_modules          | Custom `output` path required   |
| `new PrismaClient()`            | `new PrismaClient({ adapter })` |

---

### Task 1: Update Dependencies

**Files:**

- Modify: `package.json`

**Step 1: Install Prisma 7 and adapter**

```bash
npm install @prisma/client@7 @prisma/adapter-better-sqlite3
npm install -D prisma@7 dotenv
```

**Step 2: Verify installation**

Run: `npm list prisma @prisma/client @prisma/adapter-better-sqlite3`
Expected: All packages at version 7.x or compatible

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: upgrade to Prisma 7 with better-sqlite3 adapter

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 2: Create prisma.config.ts

**Files:**

- Create: `prisma.config.ts`

**Step 1: Create the config file in project root**

```typescript
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Path to schema file
  schema: "prisma/schema.prisma",

  // Migration and seed configuration
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },

  // Datasource configuration (moved from schema.prisma)
  datasource: {
    url: "file:./prisma/hackathon.db",
  },
});
```

**Step 2: Verify file created**

Run: `cat prisma.config.ts`
Expected: File contents shown

**Step 3: Commit**

```bash
git add prisma.config.ts
git commit -m "feat: add prisma.config.ts for Prisma 7

- Centralize datasource URL configuration
- Move seed command from package.json
- Configure schema and migrations paths

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 3: Update schema.prisma

**Files:**

- Modify: `prisma/schema.prisma`

**Step 1: Update generator and datasource**

Replace entire file with:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model User {
  id        String   @id @default(cuid())
  name      String
  apiKey    String   @unique
  isAdmin   Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  requests  Request[]
}

model Request {
  id        String   @id @default(cuid())
  userId    String
  model     String
  tokens    Int      @default(0)
  createdAt DateTime @default(now())

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Changes:**

- `provider` changed from `prisma-client-js` to `prisma-client`
- Added required `output` field
- Removed `url` from datasource (now in prisma.config.ts)

**Step 2: Verify schema is valid**

Run: `npx prisma validate`
Expected: Schema is valid

**Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "refactor: update schema.prisma for Prisma 7

- Change generator provider to prisma-client
- Add required output path for generated client
- Remove url from datasource (moved to config)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 4: Update lib/prisma.ts with Adapter

**Files:**

- Modify: `lib/prisma.ts`

**Step 1: Rewrite with adapter pattern**

```typescript
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "./generated/prisma";

// Create the SQLite adapter with file path
const adapter = new PrismaBetterSQLite3({
  url: "file:./prisma/hackathon.db",
});

// Global singleton pattern for Next.js hot reload
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

**Step 2: Generate Prisma client**

Run: `npx prisma generate`
Expected: Client generated to lib/generated/prisma

**Step 3: Commit**

```bash
git add lib/prisma.ts
git commit -m "refactor: use Prisma 7 adapter pattern

- Import from generated output path
- Initialize better-sqlite3 adapter
- Pass adapter to PrismaClient constructor

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 5: Update Seed Script

**Files:**

- Modify: `prisma/seed.ts`

**Step 1: Update imports and initialization**

```typescript
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../lib/generated/prisma";

// Create adapter for seed script
const adapter = new PrismaBetterSQLite3({
  url: "file:./prisma/hackathon.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const admin = await prisma.user.upsert({
    where: { apiKey: "admin" },
    update: {},
    create: {
      name: "Admin",
      apiKey: "admin",
      isAdmin: true,
    },
  });

  console.log("Created admin user:", admin);

  // Create Louis as admin
  const louis = await prisma.user.upsert({
    where: { apiKey: "sk-hackathon-louis" },
    update: {},
    create: {
      name: "Louis",
      apiKey: "sk-hackathon-louis",
      isAdmin: true,
    },
  });

  console.log("Created user:", louis);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Commit**

```bash
git add prisma/seed.ts
git commit -m "refactor: update seed script for Prisma 7

- Use better-sqlite3 adapter
- Import from generated output path

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 6: Remove package.json Prisma Block

**Files:**

- Modify: `package.json`

**Step 1: Remove the prisma block**

Remove this section from package.json:

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

**Step 2: Verify package.json is valid**

Run: `node -e "require('./package.json')"`
Expected: No errors

**Step 3: Commit**

```bash
git add package.json
git commit -m "chore: remove prisma block from package.json

Seed config moved to prisma.config.ts in Prisma 7

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 7: Add Generated Directory to .gitignore

**Files:**

- Modify: `.gitignore`

**Step 1: Add generated prisma directory**

Add to .gitignore:

```
# Prisma generated client
lib/generated/
```

**Step 2: Commit**

```bash
git add .gitignore
git commit -m "chore: ignore generated Prisma client

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

### Task 8: Generate Client and Push Database

**Step 1: Generate Prisma client**

Run: `npx prisma generate`
Expected: Client generated successfully

**Step 2: Push database schema**

Run: `npx prisma db push`
Expected: Database synced with schema

**Step 3: Seed database**

Run: `npx prisma db seed`
Expected: Admin and Louis users created

---

### Task 9: Verify Build

**Step 1: Run full build**

Run: `npm run build`
Expected: All routes compile successfully

**Step 2: Test API endpoints**

Run: `npm run dev` (background)
Then: `curl -s http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"apiKey": "sk-hackathon-louis"}'`
Expected: JSON response with user data

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Prisma 7 upgrade

- All endpoints verified working
- Database seeded successfully
- Build passes

Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Summary

After completing all tasks:

- ✅ Prisma 7 with adapter-based architecture
- ✅ Centralized config in prisma.config.ts
- ✅ Generated client in lib/generated/prisma
- ✅ No more `npx prisma@5` needed - just `npx prisma`

## Rollback Plan

If issues occur, revert to Prisma 5:

```bash
npm install @prisma/client@5 prisma@5
git checkout HEAD~N -- prisma/schema.prisma lib/prisma.ts prisma/seed.ts package.json
rm prisma.config.ts
rm -rf lib/generated
```
