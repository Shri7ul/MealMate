# MealMate

MealMate is a production-focused mess management application built with Next.js, TypeScript, Tailwind CSS, shadcn/ui patterns, and Supabase.

## Phase 1

This phase includes project setup, Supabase authentication, database schema, protected layouts, role-aware navigation, profile settings, and PWA metadata.

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Install dependencies and run the app:

```bash
npm install
npm run dev
```
