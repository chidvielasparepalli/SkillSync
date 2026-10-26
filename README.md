# SkillSync 🎓

**A peer-to-peer skill exchange and collaborative learning platform for students.**

SkillSync helps students teach a skill they know, learn a skill from another student, and manage the exchange from one simple workspace.

## What the website does

- **Account creation and sign-in:** students register with email and password; password reset is available.
- **Student profiles:** members save their name, headline, college, bio, skills they can teach, and skills they want to learn.
- **Discover students:** search by name, skill, college, and profile text; filter by category; browse real member profiles.
- **Saved students:** bookmark or unbookmark profiles; bookmarks are stored in the database.
- **Skill-exchange requests:** choose what you can teach, what you want to learn, and send a message. Both students can see the request and its status.
- **Request decisions:** recipients can accept or decline; senders can cancel pending requests.
- **Private exchange messages:** after a request is accepted, participants can message each other to arrange their learning exchange.
- **Completion tracking:** either participant can mark an accepted exchange as complete; completed conversations become read-only.
- **Responsive UI:** desktop, tablet and mobile layouts, empty states, form validation, progress indicators and clear status messages.

The site does not manufacture demo student profiles. The Discover page shows actual accounts that have created profiles. For a good interview demo, register two accounts with different skills and demonstrate the full exchange between them.

## Technology

- React 19 + TypeScript
- Vite 6
- Supabase Auth
- Supabase Postgres with Row Level Security (RLS)
- Lucide React icons
- Vercel deployment from the GitHub `main` branch

## Local development

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/chidvielasparepalli/SkillSync.git
cd SkillSync
npm install
```

Copy `.env.example` to `.env` and fill in your Supabase URL and publishable key, then run:

```bash
npm run dev
```

Build and locally preview the production bundle:

```bash
npm run build
npm run preview
```

Never place a Supabase service-role key or secret key in a `VITE_*` variable. The frontend uses only the publishable key, and RLS policies limit which rows authenticated users can access.

## Backend setup

The configured Supabase project is `skillsync-production` in the `ap-south-1` region. The core migration is stored at `supabase/migrations/20261026132635_create_skillsync_core.sql` and has been applied to that project.

In the Supabase dashboard, open **Authentication → URL Configuration** and set:

- **Site URL:** `https://skillsync-community.vercel.app`
- **Redirect URLs:** `https://skillsync-community.vercel.app/**`, `https://skillsync-smoky.vercel.app/**`, and `http://localhost:5173/**` for local testing.

This lets account confirmation and password-reset links return to the website. Email confirmation may be required by Supabase before a new account can sign in.

The Vercel project has these environment variables configured for Production, Preview, and Development:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

After changing Vercel environment variables, trigger a new deployment so Vite includes the values in the frontend bundle.

## Data and access model

The database contains four public tables:

- `profiles`: one editable profile per authenticated account.
- `exchange_requests`: sender, recipient, skills being exchanged, message, and status.
- `messages`: conversation messages for accepted exchanges.
- `saved_profiles`: per-user bookmarks.

RLS is enabled on all four tables. Profiles are discoverable only to signed-in members; students can change only their own profile and bookmarks; requests are visible only to their participants; messages are visible only to participants of accepted/completed exchanges and can be sent only while an exchange is accepted. A database trigger creates a basic profile when a new auth account is created.

## Deployment

Production URL: [https://skillsync-community.vercel.app](https://skillsync-community.vercel.app)

Source code: [GitHub repository](https://github.com/chidvielasparepalli/SkillSync)

Vercel builds with `npm run build` and serves `dist`. The default Vite asset base is `/` for Vercel. GitHub Pages uses the `github-pages` Vite mode to build with `/SkillSync/`.

## Current scope and honest limitations

This is a working skill-exchange app, not a mock profile gallery. Actual accounts, profiles, requests, bookmarks, and messages use the connected database. The app does **not** yet include built-in video calls, calendar scheduling, file uploads, ratings, or real-time push notifications; users coordinate through the message thread. The interview demo should use real accounts created by you and your friend.

## Interview guide

See [docs/INTERVIEW_GUIDE.md](docs/INTERVIEW_GUIDE.md) for a simple explanation of the pages, buttons, data model, and demonstration flow.
