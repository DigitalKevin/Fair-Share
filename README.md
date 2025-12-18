# Tab Together - The Easiest Way to Split Bills and Settle Payments

A modern, no-signup expense-splitting app for groups. Create a shareable link, add expenses, and instantly see who owes whom.

## ✨ Features

- 🔗 **Shareable Group Links** — No login required; just share a link (e.g., `tabtogether.app/g/7fA92KdQ`)
- ➕ **Add/Edit Expenses** — Full control: modify payer, amount, participants, or delete with recycle bin
- 👥 **Manage People** — Add members and remove them (auto-cleans participant lists)
- 💰 **Smart Settlement** — Greedy algorithm minimizes transaction count
- 🗑️ **Recycle Bin** — Undo deletions of people or expenses with one click
- 📱 **Modern UI** — Card-based design, avatars, responsive layout

## Tech Stack

- **Frontend**: React 18 + Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (Postgres)
- **ORM**: Prisma 5
- **Styling**: CSS Variables + Tailwind-inspired tokens
- **Deployment**: Vercel

## Quick Start

### Local Development (Supabase or SQLite)

1. Set your `DATABASE_URL` in `.env`.

For Supabase (example from your Supabase project dashboard):

```bash
# Example (set in .env or your shell)
DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>"
```

Or to use a local SQLite DB for quick testing:

```bash
DATABASE_URL="file:./prisma/dev.db"
```

Then run:

```bash
npm install
npx prisma migrate dev
npm run dev
```

Visit https://fair-share-mu.vercel.app/ and create your first group!

## Project Structure

```
app/
  ├── api/
  │   ├── groups/          # Create/fetch groups
  │   ├── people/          # Manage participants (groupId-scoped)
  │   ├── expenses/        # CRUD + edit expenses (groupId-scoped)
  │   └── balances/        # Calculate settlements (groupId-scoped)
  ├── components/
  │   ├── PeopleForm.jsx   # Add/delete people
  │   ├── ExpenseForm.jsx  # Add expenses
  │   ├── ExpenseList.jsx  # View/edit/delete expenses
  │   ├── Balances.jsx     # Settlement display
  │   └── RecycleBin.jsx   # Undo deleted items
  ├── g/[groupId]/page.jsx # Group page (scoped app)
  ├── page.jsx             # Landing (create/join groups)
  ├── layout.jsx           # Root layout + topbar
  └── globals.css          # Global styles & tokens
prisma/
  ├── schema.prisma        # Database models (Person, Expense, Group)
  ├── seed.js              # Initialize default group
  └── migrations/          # DB migrations
```

## How It Works

### Landing Page (`/`)
- **Create Group**: Enter a name, get a unique shareable link (e.g., `/g/7fA92KdQ`)
- **Join Group**: Paste a link or group code to access an existing group

### Group Page (`/g/[groupId]`)
1. **Share Link**: Copy or share the invite URL (top of page)
2. **Add People**: Create a list of group members
3. **Add Expenses**: Log description, amount, who paid, and who participated
4. **Edit/Delete**: Click the ✏️ icon to modify any expense (change payer, amount, participants)
5. **View Settlements**: See who owes whom (minimal transaction algorithm)
6. **Recycle Bin**: Undo deletions via the 🗑️ button (bottom-right)

## Settlement Algorithm

Greedy algorithm that minimizes transaction count by sorting creditors/debtors and pairing them optimally.

**Example**: Instead of A→B, A→C, D→B, D→C, it suggests A→B, B→C, D→A (fewer transactions).

## Deployment

### Supabase + Vercel (recommended)

1. Create a Supabase project and a database.
2. Copy the **Connection string** from Supabase (Settings → Database) and set it as `DATABASE_URL` in Vercel or `.env` for local testing.
  ```bash
  # example (DO NOT commit this to git)
  DATABASE_URL="postgresql://postgres:password@db.xyz.supabase.co:5432/postgres"
  ```
3. Push repository to GitHub and connect the project in Vercel.
4. In Vercel, set `DATABASE_URL` as an environment variable (use the Supabase connection string).
5. Run Prisma migrations on deploy or manually with:
  ```bash
  # on CI or server (production)
  npx prisma migrate deploy
  ```

Notes:
- Supabase provides a managed Postgres instance; use the provided connection string.
- If you run into connection limits, consider using Supabase's connection pooling or an external pooler (PgBouncer).
- Keep your `DATABASE_URL` secret and do not commit it to source control.

## API Reference

All endpoints accept `?groupId=<id>` (defaults to `'default'` for backward compatibility).

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/groups` | POST | Create group (returns `{id, name, createdAt}`) |
| `/api/groups?groupId=...` | GET | Fetch group with people & expenses |
| `/api/people?groupId=...` | GET/POST/DELETE | Manage people |
| `/api/expenses?groupId=...` | GET/POST/PATCH/DELETE | Manage expenses |
| `/api/balances?groupId=...` | GET | Get settlements |

### Example: Create a Group

```bash
curl -X POST http://localhost:3000/api/groups \
  -H "Content-Type: application/json" \
  -d '{"name":"Roommates"}'

# Returns: {"id":"abc123","name":"Roommates","createdAt":"2025-12-13T..."}
```

### Example: Add an Expense

```bash
curl -X POST "http://localhost:3000/api/expenses?groupId=abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "description":"Dinner",
    "amount":50,
    "payerId":1,
    "participants":[1,2,3]
  }'
```

### Example: Edit an Expense

```bash
curl -X PATCH "http://localhost:3000/api/expenses?groupId=abc123" \
  -H "Content-Type: application/json" \
  -d '{
    "id":5,
    "description":"Lunch",
    "amount":35,
    "participants":[1,2]
  }'
```

## Future Roadmap

- 📸 Receipt uploads
- 🔄 Recurring expenses
- 📱 Native mobile app
- 💳 Payment integration (Stripe, PayPal)
- 📊 Analytics & charts
- 🌙 Dark mode
- 🌍 Multi-language support
