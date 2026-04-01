# Detailed Implementation Plan – Salon Management App (Updated)

> **Purpose** – This document breaks the high‑level `PLAN.md` into granular phases, sub‑tasks, and topic‑based explanations. It is written for any subsequent agent (or human) to quickly understand:
> - What has been completed
> - What remains
> - The exact steps and validation commands needed for each remaining task
> - The current project status so agents can pick up where the previous work left off.

---

## 1. Project Overview
- **Goal** – Deliver an MVP salon management mobile app (React Native CLI + TypeScript) that supports Super Admin, Salon Owner, Staff, Customer, and limited Vendor roles with RBAC, Supabase backend, and a modular folder structure.
- **Tech‑stack decision** – Because we are staying on React 19, we will **use Zustand alone for global UI state** for now (instead of React Query, Recharts, etc.). Future versions of `@tanstack/react-query` and `recharts` are expected to add React 19 peer‑dependency support, so they can be added later without code changes.
- **Reference Documents** – 
  - `.claude/PRD.md` – Full product requirements, user stories, success criteria.  
  - `.claude/.agents/AGENT.md` – Agent rules.  
  - `CLAUDE.md` – High‑level project overview.  
  - `.claude/plans/PLAN.md` – High‑level phase outline (already created).

---

## 2. Current Status (as of today)

| Phase | Tasks Completed | Tasks Remaining |
|-------|----------------|-----------------|
| **Phase 1 – Project Foundations** | - Repo initialized (`git init`)<br>- `salon_rn_project` scaffolded (TypeScript template)<br>- `npm install` completed (core deps: **Zustand**, `dnd-kit`, `framer‑motion` – no `react-query`/`recharts` yet)<br>- `biome.json` added and passing (`npx biome check . --write` shows 0 warnings)<br>- Folder structure (`core/`, `modules/`, `shared/`, `navigation/`, `store/`, `tests/`) created | - **Set up Supabase project & `.env`** (still pending)<br>- Generate TypeScript types (`npx supabase gen types typescript …`)<br>- Initialize CI/CD (Vercel) |
| **Phase 2 – Core Editor** | – None yet | - Profile editor UI<br>- Service CRUD + drag‑and‑drop<br>- Theme picker & live preview<br>- Save button with toast feedback<br>- Unit & E2E tests |
| **Phase 3 – Public Pages & SEO** | – None yet | - Dynamic `[slug]` SSR route<br>- OG meta tags<br>- Reserved‑slug protection<br>- Landing page (`/`)<br>- Responsiveness testing |
| **Phase 4 – Analytics** | – None yet | - Click‑tracking endpoint<br>- Analytics dashboard UI<br>- Period filtering<br>- Integration with public page clicks |
| **Phase 5 – Polish & Launch** | – None yet | - Lighthouse performance audit<br>- Bug‑fix sprint<br>- Production deploy to Vercel<br>- Documentation sync & monitoring setup |

> **Note for agents:** All tasks in **Phase 1** except Supabase setup and Vercel configuration are **already verified** (lint, test, git status clean). The next logical step is to finish **Phase 1** by completing Supabase setup, then move on to Phase 2.

---

## 3. Phase‑by‑Phase Breakdown

### Phase 1 – Project Foundations (Updated)
**Tasks:**
1. 🛠️ **Scaffold React Native project** – `npx @react-native-community/cli@latest init salon_rn_project` (TypeScript template).  
2. 📁 **Initialize repository** – `git init`, create `.gitignore`, push initial commit to GitHub.  
3. 📦 **Install core dependencies** – `npm install zustand dnd-kit framer-motion` (React Query and Recharts postponed).  
4. 🧹 **Configure linting & formatting** – add `biome.json`, run `npx biome init`.  
5. 🗂️ **Create folder structure** – `core/`, `modules/`, `shared/`, `navigation/`, `store/`, `tests/`.  
6. 🔐 **Set up Supabase project & `.env`** – enable Auth, create `DATABASE_URL`, generate types: `npx supabase gen types typescript --project-id … --schema public > core/api/supabase-types.ts`.  
7. 🛡️ **Initialize CI/CD** – add Vercel project, link repo, configure environment variables.  

**Validation Commands:**
- `git status` – Ensure clean working tree.  
- `npm run biome check . --write` – Zero warnings required.  
- `npm test -- --coverage` – All unit tests pass (initial scaffold only).  
- `npx supabase types generate` – Types generated successfully.  

---

### Phase 2 – Core Editor (Profile + Service Catalog)
*(unchanged – see earlier detailed breakdown)*  

*(Same tasks as previously listed – Profile editor, Service CRUD with drag‑and‑drop, Theme picker, Live preview, Save button, unit/E2E tests.)*  

---

### Phase 3 – Public Pages & SEO
*(unchanged – see earlier detailed breakdown)*  

---

### Phase 4 – Analytics Dashboard
*(unchanged – see earlier detailed breakdown)*  

---

### Phase 5 – Polish & Launch
*(unchanged – see earlier detailed breakdown)*  

---

## 4. Topic‑Based Explanations (for Agent Reference)

*(same as previous version – unchanged)*  

---

## 5. Git Commit / Status Check Rule (Updated)

> **Git Status & Commit Policy** – Before any write operation, the agent **MUST** run `git status` to ensure a clean working tree. If there are staged or unstaged changes, the agent must either commit them with a descriptive message (e.g., `git commit -am "WIP: <task‑name>"`) or abort the operation and request clarification. This guarantees that the repository never contains uncommitted modifications when code is written or modified.

---

## 6. How New Agents Can Catch Up

1. **Read the “Current Status” table** at the top of this file – it tells you exactly which tasks are *done* and which are *pending*.  
2. **Open the relevant phase folder** (e.g., `modules/booking/`, `tests/e2e/`) to see what has already been implemented.  
3. **Run the validation command** listed for the next pending task to ensure the environment is ready.  
4. **Consult the “Topic‑Based Explanations”** for deeper insight into patterns, imports, and testing approaches.  
5. **Follow the “Implementation Plan”** step‑by‑step; each task is atomic and includes a concrete `VALIDATE:` command that can be executed to confirm success before moving on.

---

### Final Note
This `DETAILED_PLAN.md` is the single source of truth for **what to do next** and **how to verify each step**. Any agent (or human) should treat it as the roadmap for the remainder of the project. All future modifications must respect the task ordering, validation commands, and the git‑status/commit policy described above.  
