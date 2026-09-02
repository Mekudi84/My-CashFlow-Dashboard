# BasseyFlow — Personal Finance Dashboard

> **Financial clarity. Smarter cash flow.**

A premium multi-user finance dashboard built with **React + Vite + Supabase**.

Each user has a completely isolated account, secured by **Supabase Auth** (email + password with email/OTP verification) and **Postgres Row Level Security (RLS)**.

## Features

- Secure sign up, sign in, sign out, password reset
- Email/OTP verification before dashboard access
- Protected routes — unauthenticated users cannot reach `/`
- Row Level Security on every user-owned table
- Per-user transactions, budgets, and (future) savings goals
- Income / expense / balance / savings rate calculations
- Cash-flow bar chart, expense breakdown, recent transactions
- Search, filter (type + category), sort (newest/oldest/high/low)
- Add / edit / delete transactions and budgets
- Currency selector (NGN, USD, GBP, EUR)
- Light / dark theme toggle
- localStorage retained for non-sensitive UI prefs (theme, currency)
- Responsive: desktop, tablet, mobile
- Empty states for new accounts (no demo data)

## Architecture

- **Frontend** — React 18 + Vite, react-router-dom, recharts
- **Backend** — Supabase (Postgres + Auth + RLS)
- **Auth** — `src/contexts/AuthContext.jsx`, pages under `src/components/auth/`
- **Data hook** — `src/hooks/useFinanceData.js` (queries Supabase, never localStorage as a source of truth)
- **Schema** — `supabase/schema.sql` (idempotent)

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project**

   - Go to https://app.supabase.com and create a new project.
   - Wait for the database to finish provisioning.

3. **Apply the database schema**

   - In Supabase Dashboard: **Project → SQL Editor → New query**
   - Paste the entire contents of `supabase/schema.sql` and run it.
   - This creates `profiles`, `transactions`, `budgets`, and `savings_goals` tables, plus Row Level Security policies, indexes, and triggers.

4. **Enable email auth & email confirmations**

   - In Supabase Dashboard: **Authentication → Providers**
   - Make sure **Email** is enabled.
   - Under **Authentication → Sign In / Up → Email**, enable **Confirm email** so a 6-digit code is sent to new users.

5. **Add your credentials**

   - Copy `.env.example` → `.env`.
   - From **Project Settings → API**, copy the **Project URL** and **anon public** key into `.env`:

     ```env
     VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
     VITE_SUPABASE_ANON_KEY=<your-anon-key>
     ```

6. **Run the app**

   ```bash
   npm run dev
   ```

   Then open http://localhost:5173.

## Production build

```bash
npm run build
npm run preview
```

## Multi-user isolation — how to test

1. Create **Account A** at `/signup` (e.g. `userA@example.com`) and verify the email OTP.
2. Add transactions and budgets while signed in as A.
3. Sign out from the sidebar.
4. Create **Account B** at `/signup` (e.g. `userB@example.com`) and verify.
5. Confirm Account B sees an empty dashboard (no data from A).
6. Add different transactions as B.
7. Sign out and sign back in as A — only A's data is visible.

## Security checklist before production

- [ ] `Confirm email` is enabled in Supabase Auth.
- [ ] `.env` is **not** committed; only `.env.example` is.
- [ ] No `service_role` key appears anywhere in the frontend code.
- [ ] RLS is **enabled** on every user-owned table (run `select * from pg_tables where schemaname='public' and rowsecurity=false;` — should return 0 rows for your tables).
- [ ] Supabase project password is strong and stored only in your password manager.
- [ ] Email-template sender domain is configured (SPF/DKIM) to avoid reset links landing in spam.

## File map

```
src/
  lib/supabase.js              # Supabase client (reads env)
  contexts/AuthContext.jsx     # session, user, sign-in/out, OTP
  hooks/useFinanceData.js      # user-scoped data from Supabase
  components/
    ProtectedRoute.jsx         # redirects unauthenticated users
    auth/
      AuthShell.jsx
      SignIn.jsx
      SignUp.jsx
      VerifyOtp.jsx
      ForgotPassword.jsx
      ResetPassword.jsx
      AuthCallback.jsx
      SetupRequired.jsx
    Sidebar.jsx                # brand + nav + signed-in account
    ...existing dashboard components unchanged
supabase/schema.sql            # tables, RLS, indexes, triggers
```

## Live demo

[https://my-cash-flow-dashboard-phi.vercel.app/](https://my-cash-flow-dashboard-phi.vercel.app/)
