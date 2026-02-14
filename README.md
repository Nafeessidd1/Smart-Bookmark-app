# Smart Bookmark App

A simple bookmark manager with **Google-only sign-in**, private per-user bookmarks, and **real-time sync** across tabs (no refresh needed). Built with Next.js (App Router), Supabase (Auth, Database, Realtime), and Tailwind CSS.

**Getting "connection failed" or don't have a SQL server?** → See **[SETUP_GUIDE.md](./SETUP_GUIDE.md)**. You don't need any local database; Supabase runs everything in the cloud. The guide walks through Supabase + Google OAuth and running the SQL migration in Supabase's built-in editor.

## Live app

- **Vercel:** [Add your live URL after deployment]

## Features

- Sign up / log in with **Google only** (no email/password)
- Add bookmarks (URL + optional title)
- Bookmarks are **private** (User A cannot see User B’s bookmarks)
- **Real-time updates**: open two tabs, add or delete in one, and the other updates automatically
- Delete your own bookmarks
- Deployed on Vercel

## Tech stack

- **Next.js 14** (App Router)
- **Supabase**: Auth (Google OAuth), PostgreSQL, Realtime
- **Tailwind CSS** for styling

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers**, enable **Google** and add your Google OAuth Client ID and Secret (from [Google Cloud Console](https://console.cloud.google.com/)).
3. In **SQL Editor**, run the migration in `supabase/migrations/001_bookmarks.sql` to create the `bookmarks` table, RLS policies, and enable Realtime.
4. In **Database → Publications**, ensure `supabase_realtime` includes the `bookmarks` table (the migration does this via SQL).
5. In **Authentication → URL Configuration**, set **Site URL** to your app URL (e.g. `https://your-app.vercel.app`) and add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**.

### 2. Google OAuth (for Google sign-in)

1. In Google Cloud Console, create OAuth 2.0 credentials (Web application).
2. Add **Authorized redirect URIs**:  
   `https://<YOUR_SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
3. Add **Authorized JavaScript origins**:  
   - Dev: `http://localhost:3000`  
   - Prod: `https://your-app.vercel.app`

### 3. Local env

Copy `.env.local.example` to `.env.local` and set:

- `NEXT_PUBLIC_SUPABASE_URL` – Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` – Supabase anon/public key

### 4. Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Deploy on Vercel

1. Push the repo to GitHub and import the project in Vercel.
2. In Vercel, add the same env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy. Then set Supabase **Site URL** and **Redirect URLs** to your Vercel URL (and `/auth/callback`) as in step 1.

## Problems encountered and solutions

### 1. Realtime not firing in second tab

- **Problem:** Second tab didn’t update when adding/deleting in the first.
- **Cause:** Either the `bookmarks` table wasn’t in the `supabase_realtime` publication, or the client wasn’t using the same authenticated session (cookies).
- **Solution:** Ran `alter publication supabase_realtime add table public.bookmarks` in Supabase SQL. Ensured the Realtime subscription is created with the **browser Supabase client** (`createClient()` from `@/utils/supabase/client`) so it uses the cookie-based session. With RLS, each user only receives events for their own rows.

### 2. Auth callback redirect loop or “auth” error

- **Problem:** After Google sign-in, redirect to `/auth/callback` sometimes failed or showed an error.
- **Solution:** In Supabase **Authentication → URL Configuration**, added the exact **Redirect URL** (e.g. `https://myapp.vercel.app/auth/callback`). For local dev, added `http://localhost:3000/auth/callback`. The callback route uses `exchangeCodeForSession(code)` and then redirects to `next` or `/`.

### 3. Middleware not refreshing session / cookies

- **Problem:** Session sometimes expired or didn’t persist across requests.
- **Solution:** Used `@supabase/ssr` and the recommended middleware: `createServerClient` with `getAll`/`setAll` cookies. Important: `setAll` must write to the **response** object (e.g. `response.cookies.set(...)`), not the request, so the updated cookies are sent back to the browser.

### 4. RLS blocking inserts

- **Problem:** `insert` into `bookmarks` returned a permission error.
- **Solution:** Added an RLS policy: “Users can insert own bookmarks” with `with check (auth.uid() = user_id)`. The app always sets `user_id` via the Supabase client (using the authenticated user), so inserts succeed when the JWT’s `sub` matches `user_id`.

---

## GitHub repo

- **Repo:** [Add your public GitHub repo URL]

## License

MIT
