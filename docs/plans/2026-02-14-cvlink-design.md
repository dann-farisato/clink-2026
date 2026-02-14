# CVLink — Design Document

## Overview
CVLink is a B2C AI-assisted CV/Resume builder. Users create CVs with AI help (powered by Claude), edit in a structured editor with live preview, and export to PDF, DOCX, or a shareable hosted page.

## Stack
- **Frontend:** Next.js 14+ (App Router), TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Firebase (Auth, Firestore, Storage)
- **AI:** Anthropic Claude API via Next.js API routes
- **Export:** PDF (react-pdf or puppeteer), DOCX (docx library)

## Architecture
Next.js monorepo. Firebase handles auth and data. AI calls go through server-side API routes to keep the Anthropic key secure. CV editor is client-side with real-time Firestore sync.

### Project Structure
```
src/
  app/           → Next.js App Router pages & layouts
  components/    → UI components (editor, preview, shared)
  lib/           → Firebase config, AI client, export utilities
  hooks/         → Custom React hooks
  types/         → TypeScript types/interfaces
```

## Core User Flow
1. Sign up/login (Firebase Auth — Google, email/password)
2. Create new CV → AI asks questions about role/industry/experience
3. AI generates initial CV content section by section
4. User edits in structured editor with live preview
5. Export to PDF, DOCX, or publish as shareable hosted page

## Data Model (Firestore)

### users/{uid}
- email, displayName, photoURL, createdAt

### users/{uid}/cvs/{cvId}
- title, slug (for shareable link), templateId
- status: "draft" | "published"
- createdAt, updatedAt
- sections:
  - summary: { content, aiGenerated }
  - experience: [{ company, role, dates, bullets, aiGenerated }]
  - education: [{ institution, degree, dates }]
  - skills: [{ category, items }]
  - custom: [{ heading, content }]
- settings: { theme, font, colorAccent }

## AI Integration
- User clicks "AI Assist" on any section → POST `/api/ai/generate`
- API route calls Claude with CV-writing system prompt
- Returns structured JSON mapped to section schema
- User can accept, edit, or regenerate
- AI capabilities: generate content, improve bullets, tailor to job description, suggest missing sections

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page (marketing) |
| `/login` | Auth (sign in / sign up) |
| `/dashboard` | List of user's CVs, create new |
| `/editor/[cvId]` | CV editor with live preview |
| `/cv/[slug]` | Public shareable CV page |

## Key Components
- **CVEditor** — Section-based editing with inline AI assist buttons
- **CVPreview** — Live preview panel, real-time updates
- **TemplateSelector** — 3-4 clean CV templates (React components receiving same data)
- **AIAssistPanel** — Slide-out for AI interactions
- **ExportMenu** — PDF, DOCX download + copy shareable link

## Editor Layout
Split-pane: left = form editor, right = live preview. Mobile: tabs between edit/preview.
