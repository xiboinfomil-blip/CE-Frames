# Database Migration Instructions

## 🔴 Critical Issue Found

**Error:** `column galleries.updated_at does not exist` on production

The production database is missing the `updated_at` column that was added to the schema but never migrated.

## ✅ Solution

### Step 1: Run Drizzle Migration

Execute the new migration on your production database:

```bash
# Install dependencies (if not already done)
npm install

# Run migrations (this will apply migration 0006)
npx drizzle-kit migrate --dialect postgresql
```

Or if you prefer to manually run the SQL, execute:

```sql
ALTER TABLE "galleries" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;
```

### Step 2: Deploy the Code

After the migration is applied to the database:

```bash
# Push the code changes to your repository
git add -A
git commit -m "fix: add updated_at column to galleries table - migration 0006"
git push origin main
```

Vercel will automatically redeploy with the latest code.

### Step 3: Verify

Once deployed, the home page should load without the 500 error.

## 📝 Files Changed

- `drizzle/0006_add_galleries_updated_at.sql` - Migration file
- `drizzle/meta/_journal.json` - Migration tracking
- `drizzle/meta/0006_snapshot.json` - Schema snapshot

## 🔗 What This Fixes

- ✅ Resolves `column galleries.updated_at does not exist` error
- ✅ Allows `getLatestPublic` queries to work on production
- ✅ Home page will load galleries correctly
- ✅ Syncs production database schema with code

---

**⚠️ Important:** Apply the database migration BEFORE deploying the code changes.
