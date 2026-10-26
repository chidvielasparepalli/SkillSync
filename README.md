# SkillSync 🎓

**A peer-to-peer skill exchange and collaborative learning platform for students.**

SkillSync helps students share skills they already have, find peers who can teach them something new, and make learning more social and affordable.

## Current status

The repository currently contains a responsive React + TypeScript + Vite landing page with skill-search, category filters, saved demo profiles, and skill-swap request UI. Profiles and requests on the public landing page are illustrative demo data; they are not persisted yet.

## Features in this starter

- Responsive landing page and product introduction
- Student skill partner discovery cards
- Search by name, skill, role, or interest
- Filter by Development, Design, Data & AI, and Communication
- Save/unsave demo profiles in the current browser session
- Skill-swap interaction feedback
- Responsive layout for mobile, tablet, and desktop

## Tech stack

- React
- TypeScript
- Vite
- CSS
- Lucide React icons

## Run locally

Requirements: Node.js 20+ and npm.

```bash
git clone https://github.com/chidvielasparepalli/SkillSync.git
cd SkillSync
npm install
npm run dev
```

Open the local URL printed by Vite.

Build for production:

```bash
npm run build
npm run preview
```

## Configuration

Copy `.env.example` to `.env` when integrating a backend. Never expose private keys in frontend environment variables.

## Live deployment

The production bundle is configured for the GitHub Pages project URL:
`https://chidvielasparepalli.github.io/SkillSync/`

To publish it, open **Settings → Pages** in this repository and set **Build and deployment → Source** to **GitHub Actions**. The workflow in `.github/workflows/pages.yml` then builds and deploys the site on pushes to `main`. The connected GitHub integration cannot enable the Pages service on behalf of the repository owner, so this one-time setting must be enabled by the owner.

## Planned implementation

1. Authentication and student profile management
2. Persistent skills offered and skills wanted
3. Matching students based on complementary skills
4. Send, accept, and reject skill exchange requests
5. Peer messaging and session scheduling
6. Learning resource sharing and collaboration
7. Session feedback and ratings
8. Database policies, tests, accessibility checks, and deployment

## Project abstract

SkillSync is designed to support students exchanging skills such as Python, Java, design, and web development. Its goal is to promote peer learning, teamwork, communication, and continuous skill development.

## Contributing

Create a branch, make focused changes, run `npm run build`, then open a pull request.

---

Made for curious minds. ✨
