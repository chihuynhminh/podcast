# SETUP_001: Environment Configuration

## Overview

This document guides you through setting up your local development environment to run the Music Manager application. The setup includes Supabase project configuration, database schema application, and environment variable setup.

---

## Part 1: Supabase Project Setup

### Step 1: Create User Accounts (First-Time Setup)

Before any deployment, your Supabase project admin must create user accounts for development/testing:

1. **Open Supabase Dashboard**
   - Navigate to your project: https://supabase.com/dashboard/projects

2. **Go to Authentication > Users**

3. **Create Test Users**
   - Click "Invite"
   - Enter email: `test@example.com`
   - Enter password: (set a secure password)
   - Confirm

**Do this for:**
- `test@example.com` (primary test user)
- `test2@example.com` (for testing sharing features)

*(In production, users create accounts via auth portal, not manual invites)*

---

## Part 2: Database Schema Application

### Step 1: Apply Initial Schema

1. **Open Supabase SQL Editor**
   - Navigate to: SQL Editor tab in your Supabase dashboard

2. **Create New Query**
   - Click "New Query" or "+"
   - Name it: `001_initial_schema`

3. **Copy and Paste SQL**
   - Open `.supabase/migrations/001_initial_schema.sql` from your project
   - Copy the ENTIRE contents
   - Paste into Supabase SQL editor

4. **Run the Query**
   - Click "Run" (or Ctrl+Enter)
   - Wait for completion (should take 5-10 seconds)

**Expected Output:**
```
Query successful
created_extension (1 row)
created_table_users (1 row)
created_table_songs (1 row)
created_table_playlists (1 row)
created_table_playlist_songs (1 row)
created_table_playback_positions (1 row)
created_table_playlist_shares (1 row)
...
```

### Step 2: Verify Table Creation

1. **Go to Table Editor**
   - Click "Table Editor" in sidebar

2. **Verify All 6 Tables Exist:**
   - [ ] `users` - 4 columns
   - [ ] `songs` - 8 columns
   - [ ] `playlists` - 5 columns
   - [ ] `playlist_songs` - 4 columns
   - [ ] `playback_positions` - 6 columns
   - [ ] `playlist_shares` - 5 columns

3. **Check RLS is Enabled**
   - Select any table
   - Look for "RLS Enabled" (should show green checkmark)

---

## Part 3: Storage Bucket Setup

### Step 1: Create Songs Bucket

1. **Open Supabase Storage**
   - Navigate to: Storage tab in dashboard

2. **Create New Bucket**
   - Click "New Bucket"
   - Name: `songs`
   - Privacy: **Private**
   - Click "Create Bucket"

3. **Verify Bucket**
   - You should see `songs` bucket in the list
   - Status should show as "Private"

### Step 2: Configure Bucket Policies (Optional - for downloads)

If you want users to download their uploaded files:

1. **Select the `songs` bucket**
2. **Go to Policies tab**
3. **Create Read Policy:**
   - Click "New Policy"
   - Template: "Allow authenticated users to download from songs bucket"
   - This auto-creates:
     ```sql
     CREATE POLICY "Allow authenticated users to download"
     ON storage.objects FOR SELECT
     USING (bucket_id = 'songs' AND auth.role() = 'authenticated');
     ```

---

## Part 4: Environment Variables Setup

### Step 1: Get Your Credentials

1. **Open Supabase Project Settings**
   - Dashboard > Settings (bottom left)

2. **Copy API Keys:**
   - Find "API" section
   - Copy `Project URL` → this is `VITE_SUPABASE_URL`
   - Copy `anon` key → this is `VITE_SUPABASE_ANON_KEY`

**Example values:**
```
VITE_SUPABASE_URL=https://abcdef123456.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 2: Configure Local Environment

1. **Create `.env.local` in `frontend/` directory**
   ```bash
   cp frontend/.env.example frontend/.env.local
   ```

2. **Edit `frontend/.env.local`**
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Verify (do NOT commit .env.local to git!)**
   - The `.gitignore` already excludes it
   - File should not be in git tracking: `git status`

---

## Part 5: Verify Setup

### Step 1: Verify Supabase Connection

```bash
cd frontend
npm run dev
```

You should see:
- Build succeeds
- App opens at http://localhost:5173
- Login form appears (email/password inputs)

### Step 2: Test Database Connection

1. **Login with test user**
   - Email: `test@example.com`
   - Password: (the password you set)
   - Click "Login"

2. **Expected Result:**
   - Login succeeds
   - Dashboard loads (placeholder "Welcome to Music Manager")
   - No console errors (check browser F12 > Console)

3. **Check Database Access**
   - If getting SQL errors in console: verify RLS policies were applied
   - If auth fails: verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct

### Step 3: Test Database Writes

*(This will be covered in Phase 2 implementation, but you can verify manually:)*

1. **In Supabase SQL Editor, run:**
   ```sql
   INSERT INTO users (id, email) VALUES (auth.uid(), 'test@example.com');
   SELECT * FROM users;
   ```

2. **Expected:** Your user record exists in the table

---

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution:**
- Verify `.env.local` exists in `frontend/` directory
- Verify it contains both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart `npm run dev`

### Issue: Login fails with error

**Solutions to try:**
1. Check user exists: Supabase Dashboard > Authentication > Users
2. Verify credentials are correct
3. Check browser console (F12) for error message
4. Try resetting password in Supabase Auth

### Issue: "RLS policy prevents access"

**Solution:**
- This means RLS policy blocks the operation (expected for shared data)
- Verify you're logged in as the correct user
- Check table policy is created (SQL Editor should show no errors on 001_initial_schema.sql)

### Issue: Tables don't exist

**Solution:**
1. Double-check SQL ran without errors
2. In SQL Editor, run: `SELECT * FROM information_schema.tables WHERE table_schema='public';`
3. You should see all 6 tables listed
4. If missing, re-run the migration SQL

---

## Next Steps

Once setup is complete and verified:

1. **Start Phase 2 Implementation**
   - Build Dashboard layout
   - Implement playlist CRUD
   - Create song library view

2. **Reference:**
   - See `IMPL_001_phase_1_foundation.md` for full Phase 1 tasks
   - See `application_documents/03_design/DSGN_002_database_schema.md` for database details

---

## Summary Checklist

- [ ] Supabase project created with URL and anon key
- [ ] Test users created (test@example.com, test2@example.com)
- [ ] 001_initial_schema.sql applied via SQL Editor (no errors)
- [ ] All 6 tables exist in Table Editor
- [ ] RLS policies enabled on all tables
- [ ] `songs` storage bucket created (Private)
- [ ] `.env.local` configured with credentials
- [ ] `npm run dev` runs without errors
- [ ] Login form appears and works
- [ ] Dashboard loads after login

---

**Last Updated:** 2026-03-25
**Status:** Ready for Phase 1 Verification
