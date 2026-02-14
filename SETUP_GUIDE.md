# Setup Guide – No SQL Server Needed

You **do not need** any local SQL server or database. Supabase runs everything in the cloud (free tier is enough).

---

## Step 1: Create a Supabase project (2 minutes)

1. Go to **[supabase.com](https://supabase.com)** and sign in (GitHub or email).
2. Click **New project**.
3. Pick an organization (or create one), name the project (e.g. `smart-bookmarks`), set a database password (save it somewhere), choose a region, then click **Create project**.
4. Wait until the project is ready (green status).

---

## Step 2: Get your app keys

1. In the Supabase dashboard, open **Project Settings** (gear icon in the left sidebar).
2. Go to **API**.
3. Copy and save:
   - **Project URL** (e.g. `https://xxxxx.supabase.co`)
   - **anon public** key (under "Project API keys").

Put them in your app’s **`.env.local`** (in the project root):

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-anon-key
```

Restart the dev server after changing `.env.local` (`npm run dev`).

---

## Step 3: Create the database table (no local SQL – use Supabase’s editor)

1. In Supabase, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Paste the contents of **`supabase/migrations/001_bookmarks.sql`** (from this repo).
4. Click **Run** (or press Ctrl+Enter).

You should see “Success”. That’s it – the table and permissions are created in Supabase’s cloud. No SQL Server or local database needed.

---

## Step 4: Enable Google sign-in in Supabase

1. In Supabase, go to **Authentication** → **Providers**.
2. Find **Google** and turn it **ON**.
3. You’ll need a **Client ID** and **Client Secret** from Google (Step 5). Leave the Supabase tab open.

---

## Step 5: Create Google OAuth credentials

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)**.
2. Create or select a **project** (top bar).
3. Open **APIs & Services** → **Credentials**.
4. Click **Create credentials** → **OAuth client ID**.
5. If asked, set the **OAuth consent screen**:
   - User type: **External** (or Internal if it’s only for your org).
   - App name: e.g. **Smart Bookmark App**.
   - Support email: your email. Save.
6. Back in **Create OAuth client ID**:
   - Application type: **Web application**.
   - Name: e.g. **Smart Bookmark**.
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (for local dev)
     - Your Vercel URL later, e.g. `https://your-app.vercel.app`
   - **Authorized redirect URIs:** add **exactly**:
     - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`  
       (replace `YOUR_SUPABASE_PROJECT_REF` with the part from your Project URL, e.g. `abcdefgh` from `https://abcdefgh.supabase.co`).
7. Click **Create** and copy the **Client ID** and **Client Secret**.

---

## Step 6: Put Google credentials into Supabase

1. Back in Supabase → **Authentication** → **Providers** → **Google**.
2. Paste the **Client ID** and **Client Secret** from Google.
3. Click **Save**.

---

## Step 7: Set redirect URLs in Supabase

1. In Supabase go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to:
   - Local: `http://localhost:3000`
   - Or your Vercel URL when you deploy, e.g. `https://your-app.vercel.app`
3. Under **Redirect URLs**, add:
   - `http://localhost:3000/auth/callback`
   - When you deploy: `https://your-app.vercel.app/auth/callback`
4. Save.

---

## Step 8: Try “Sign in with Google” again

1. Make sure `.env.local` has the correct **Project URL** and **anon** key.
2. Restart dev server: stop it (Ctrl+C) and run `npm run dev` again.
3. Open **http://localhost:3000** and click **Sign in with Google**.

If it still says “connection failed”, check:

- **.env.local** – no typos, no quotes around the values, file is in the project root.
- **Browser console** (F12 → Console) and **terminal** where `npm run dev` runs – any error messages?
- **Supabase dashboard** → **Project Settings** → **API** – is “Project URL” reachable in the browser?

---

## Quick checklist

| Step | What | Where |
|------|------|--------|
| 1 | Supabase project created | supabase.com |
| 2 | `.env.local` has URL + anon key | Project root |
| 3 | SQL migration run once | Supabase → SQL Editor |
| 4 | Google provider ON | Supabase → Auth → Providers |
| 5 | OAuth client created, redirect URI = `https://XXX.supabase.co/auth/v1/callback` | Google Cloud Console |
| 6 | Client ID + Secret in Supabase | Supabase → Auth → Providers → Google |
| 7 | Site URL + Redirect URLs | Supabase → Auth → URL Configuration |

No SQL Server or local database is required – only the Supabase dashboard and Google Cloud Console.
