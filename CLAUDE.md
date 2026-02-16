# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CVLink is a B2C AI-assisted CV/Resume builder. Users create CVs with AI help (Claude API), edit in a structured editor with live preview, and export to PDF, DOCX, or a shareable hosted page.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with TypeScript
- **Styling:** Tailwind CSS v4 + shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI:** Anthropic Claude API via server-side API routes
- **Package manager:** npm

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

Add shadcn/ui components:
```bash
npx shadcn@latest add <component-name>
```

## Architecture

### Data Flow
- Firebase Auth handles user sessions (Google + email/password)
- CV data lives in Firestore at `users/{uid}/cvs/{cvId}`
- AI calls go through Next.js API routes (`/api/ai/generate`) to keep the Anthropic API key server-side
- The AI client (`src/lib/ai.ts`) uses structured prompts per action type and expects JSON responses from Claude

### Key Abstractions
- **`src/hooks/use-auth.ts`** — Auth state + sign-in/sign-out methods. Wraps Firebase Auth with `onAuthStateChanged` listener.
- **`src/hooks/use-cv.ts`** — Two hooks: `useCVList()` for dashboard (list/create/delete) and `useCV(cvId)` for the editor (read/update single CV). Both depend on `useAuth()` for the user context.
- **`src/lib/ai.ts`** — Server-only. AI content generation with action-based routing (`generate-summary`, `improve-bullets`, `tailor-to-job`, etc.). Called exclusively from API routes.
- **`src/lib/firebase.ts`** — Firebase app singleton. Exports `auth`, `db`, `storage`.
- **`src/types/cv.ts`** — Core data types (`CV`, `CVSections`, `ExperienceEntry`, etc.) that mirror the Firestore document structure.

### Route Structure
| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/login` | Auth (sign in / sign up) |
| `/dashboard` | User's CV list |
| `/editor/[cvId]` | CV editor with live preview |
| `/cv/[slug]` | Public shareable CV page (no auth) |
| `/api/ai/generate` | AI content generation endpoint |

### Component Organization
- `src/components/editor/` — CV editor form components
- `src/components/preview/` — Live preview and template renderers
- `src/components/ai/` — AI assist panel and interactions
- `src/components/shared/` — Reusable UI components
- shadcn/ui components go in `src/components/ui/` (auto-generated)

## Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:
- `NEXT_PUBLIC_FIREBASE_*` — Firebase project config (client-side)
- `ANTHROPIC_API_KEY` — Claude API key (server-side only)

## Design Decisions

- CV templates are React components that receive the same `CVSections` data — add new templates by creating a new component in `src/components/preview/`
- AI responses are always structured JSON matching the CV type schema — the AI client parses and validates before returning
- The editor uses a split-pane layout (form left, preview right) on desktop, tabs on mobile
- Slugs for shareable pages are user-customizable with a unique suffix appended from the document ID
