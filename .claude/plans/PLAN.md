# Feature: Salon Management App – Full Project Implementation Plan

## Context
We are building a multi‑role, React‑Native‑based salon management application with the following goals:
- Provide a unified mobile UI for Super Admin, Salon Owner, Staff, Customer, and limited Vendor roles.
- Implement RBAC with tenant‑level data isolation using Supabase.
- Deliver an MVP that includes booking, staff management, service catalog, theme system, public pages, and basic analytics within ~8 weeks.
- Use a feature‑based modular structure (`core/`, `modules/`, `shared/`) and React Navigation with role‑based stacks.
- All source code will be written in TypeScript, styled with NativeWind/Tailwind, and linted/formatted with Biome.

The plan below outlines every step needed to go from a freshly scaffolded React Native project to a production‑ready MVP, with clear tasks, validation commands, and acceptance criteria.

---

## Feature Description
Create a complete, production‑ready salon management mobile app that satisfies the MVP scope defined in the PRD, using the agreed‑upon tech stack and architectural patterns.

## User Story
As a **Salon Owner**, I want a mobile app that lets me manage services, staff schedules, and appointments, see a live preview of my public page, and view basic analytics, so that I can run my salon efficiently without disparate tools.

## Problem Statement
Current salon workflows rely on paper schedules, spreadsheets, and separate POS systems, leading to errors, inefficiencies, and limited visibility. The app will consolidate these workflows into a single, secure, role‑based mobile solution.

## Solution Statement
We will scaffold a React Native project, set up Supabase for data and auth, implement a modular folder structure, add role‑based navigation, develop the core editor (profile, service catalog, theme picker), expose public SSR pages with SEO meta tags, integrate click analytics, and test everything with unit and E2E tests. Each phase will be validated before moving to the next.

## Feature Metadata
- **Feature Type**: New Capability (full MVP)
- **Estimated Complexity**: High (multiple interdependent modules)
- **Primary Systems Affected**: 
  - `core/` (Supabase client, RBAC utilities)
  - `modules/` (booking, staff, service, analytics modules)
  - `shared/` (UI primitives, theming)
  - `navigation/` (React Navigation stacks)
  - `store/` (Zustand global state)
- **Dependencies**: 
  - React Native CLI (`@react-native-community/cli`)
  - Supabase (`@supabase/supabase-js`, `neon` driver)
  - NativeWind, TailwindCSS, shadcn/ui
  - React Query, Zustand, `dnd-kit`
  - Vitest, agent‑browser (E2E)

---

## CONTEXT REFERENCES

### Files to Read (mandatory)
- `.claude/PRD.md` – Complete product requirements, user stories, architecture diagram, tech stack, success criteria.
- `.claude/.agents/AGENT.md` – Agent rules and constraints.
- `.claude/.agents/reference/documents.md` – List of reference docs.
- `CLAUDE.md` – High‑level project overview and next‑step checklist.
- `salon_rn_project/` (after project init) – Generated folder structure and default configs.

### Files to Create
| Path | Purpose |
|------|---------|
| `core/api/supabaseClient.ts` | Supabase client wrapper with TypeScript types |
| `core/auth/permissions.ts` | RBAC helper (`hasPermission`) |
| `modules/booking/screens/` | Booking UI components |
| `modules/staff/screens/` | Staff schedule UI |
| `modules/service/` | Service CRUD screens |
| `shared/theme/` | Theme definitions and preview components |
| `navigation/stacks/` | Role‑based navigation stacks |
| `store/appStore.ts` | Global UI state (e.g., theme, layout mode) |
| `tests/e2e/` | E2E test files for key flows |
| `drizzle.config.ts` | Drizzle ORM configuration |
| `biome.json` | Lint/format config |

### Relevant Documentation
- **Supabase Auth Docs** – https://supabase.com/docs/guides/auth (focus on OAuth and JWT handling)
- **React Navigation v6 Docs** – https://reactnavigation.org/docs/stack-navigator (role‑based stack pattern)
- **NativeWind Setup** – https://nativewind.dev/ (framework‑less Tailwind config)
- **Drizzle ORM Guide** – https://orm.drizzle.team/ (generating types with `supabase gen types typescript`)
- **Biome Config** – https://biome.dev/docs/getting-started (enforce zero‑warning policy)
- **Vitest Docs** – https://vitest.dev/ (unit test patterns)
- **agent‑browser Docs** – https://github.com/anthropics/agent-browser (E2E test patterns)

### Patterns to Follow
- **Folder Naming**: `core/`, `modules/`, `shared/` exactly as in PRD.
- **File Naming**: Use `.tsx` for React components, `.ts` for utilities, `.test.tsx` for tests.
- **Import Style**: Relative imports prefixed with `../`; barrel files (`index.ts`) for re‑exports.
- **Error Handling**: Throw custom `AppError` extending `Error`; log via `console.error` with structured JSON.
- **Loading States**: Use React Query’s `isLoading`/`isError` for async UI; show `Loader` component from `shared/ui`.
- **Testing**: Mirror existing unit test patterns in `tests/unit/` and E2E patterns in `tests/e2e/`.

---

## IMPLEMENTATION PLAN

### Phase 1: Project Foundations
**Tasks:**
1. 🛠️ **Scaffold React Native project** – `npx @react-native-community/cli@latest init salon_rn_project` (TypeScript template).
2. 📁 **Initialize repository** – `git init`, create `.gitignore`, set up GitHub repo.
3. 📦 **Install core dependencies** – `npm install` (React Query, Zustand, dnd-kit, Recharts, etc.).
4. 🧹 **Configure linting & formatting** – add `biome.json`, run `npx biome init`.
5. 🗂️ **Create folder structure** – `core/`, `modules/`, `shared/`, `navigation/`, `store/`, `tests/`.
6. 🔐 **Set up Supabase project & `.env`** – enable Auth, create `DATABASE_URL`, generate types: `npx supabase gen types typescript --project-id … --schema public > core/api/supabase-types.ts`.
7. 🛡️ **Initialize CI/CD** – add Vercel project, link repo, configure environment variables.

**Validation Commands:**
- `git status` – Ensure clean working tree.
- `npm ls` – Verify all packages installed.
- `npx biome check . --write` – Lint passes with zero warnings.
- `npx supabase types generate` – Types generated successfully.

### Phase 2: Core Editor (Profile + Service Catalog)
**Tasks:**
1. 🖋️ **Profile Editor UI** – `src/components/profile-form.tsx` (name, bio, avatar URL, theme selector).
2. 📋 **Service CRUD** – `modules/service/screens/` with `service-form.tsx` (add/edit/delete) and `service-list.tsx`.
3. 🔀 **Drag‑and‑Drop Reordering** – Use `dnd-kit` in `service-list.tsx`.
4. 🎨 **Theme Picker** – `shared/theme/theme-picker.tsx` with 4 theme thumbnails; preview updates instantly.
4.5 **Live Preview** – `shared/ui/preview-panel.tsx` (desktop side‑by‑side, mobile tab toggle).
5. 💾 **Save Button** – Persists changes via `PUT /api/profile`; shows toast on success/error.
6. 📂 **Unit Tests** – `tests/unit/` for form validation, theme switching, drag‑and‑drop logic.
7. 🤖 **E2E Tests** – `tests/e2e/profile.test.ts` (signup → edit → save → refresh verification).

**Validation Commands:**
- `npm run lint` – Zero warnings.
- `npm test` – All Vitest unit tests pass.
- `npx agent-browser start` – E2E flow passes.

### Phase 3: Public Pages & SEO
**Tasks:**
1. 🌐 **Dynamic `[slug]` Route** – `src/app/[slug]/page.tsx` (SSR fetch of profile + links).
2. 🏷️ **OG Meta Tags** – Inject `og:title`, `og:description`, `og:image`, `twitter:card`.
3. 📄 **Reserved‑Slug Protection** – Check against reserved list at signup.
4. 🏠 **Landing Page (`/`)** – Marketing hero with CTA to “Get Started”.
5. 📱 **Responsive Layout** – Verify on device widths 320‑1920px.
6. 🧪 **Unit Tests** – Validate slug routing, meta injection.
7. 🤖 **E2E Tests** – `tests/e2e/public-page.test.ts` (public page load, OG tags, 404 handling).

**Validation Commands:**
- `npm run build` – Next.js compiles without errors.
- `npm run preview` – Public pages render correctly.
- `npx agent-browser test public-page` – All checks pass.

### Phase 4: Analytics Dashboard
**Tasks:**
1. 📊 **Click Tracking Endpoint** – `POST /api/click` with rate limit (60/min/IP) and 10‑sec dedup.
2. 📈 **Analytics Dashboard UI** – Summary cards, top‑links table, time‑series chart (Recharts).
3. 🕒 **Period Filtering** – Toggle 7d/30d/90d data sets.
4. 🔗 **Link Click Propagation** – Attach `navigator.sendBeacon` on each public page link.
5. 🧪 **Unit Tests** – Analytics aggregation logic, rate‑limit guard.
6. 🤖 **E2E Tests** – Verify click count updates on dashboard after clicking links.

**Validation Commands:**
- `npm run test` – Analytic tests pass.
- `npx agent-browser test analytics` – End‑to‑end click flow works.

### Phase 5: Polish & Launch
**Tasks:**
1. 🚀 **Performance Audits** – Run `npm run lighthouse` target Lighthouse ≥ 90.
2. 🐞 **Bug‑Fix Sprint** – Address failures from earlier validations.
3. 📦 **Production Deploy** – Push to Vercel, enable preview URLs.
4. 📚 **Update Documentation** – Sync `README.md`, `CLAUDE.md`, and update `MEMORY.md` with final folder map.
5. 📈 **Monitoring Setup** – Add basic error tracking (Sentry or Vercel logs).

**Validation Commands:**
- `vercel deploy` – New deployment succeeds.
- `npm run lint && npm run test` – No regressions.
- Manual QA: Open the app on a device, create a booking, view analytics, ensure all flows work.

**Validation Commands Summary:**
- `git status` – Clean working tree.
- `npm run lint` – Zero warnings.
- `npm run test` – 100% of unit tests pass.
- `npx agent-browser test entire-app` – All E2E flows pass.
- `vercel --prod` – Production build succeeds.

---

## TESTING STRATEGY
- **Unit Tests**: Vitest, covering utilities, API handlers, and UI component logic. Run `npm test -- --coverage` and enforce ≥ 80% coverage on new code.
- **Integration Tests**: Use React Testing Library with Jest for component integration; test form validation, theme switching, and drag‑and‑drop behavior.
- **Edge Cases**: 
  - Duplicate slug attempts → proper error toast.
  - Rate‑limit exceeded on click endpoint → proper back‑off response.
  - Empty profile fields → validation errors.
  - Offline mode – graceful degradation (show cached data).
- **E2E Tests**: agent‑browser covering full user journeys: signup → edit profile → save → view public page → click a link → see analytics increment.

---

## VALIDATION COMMANDS
| Level | Command | Purpose |
|-------|---------|---------|
| **1 – Syntax & Style** | `npx biome check .` | Zero warnings required |
| **2 – Unit Tests** | `npm test` | All Vitest tests pass |
| **3 – Integration/E2E** | `npx agent-browser start` | Full user‑flow tests pass |
| **4 – Build** | `npm run build` | Next.js compiles cleanly |
| **5 – Deploy Test** | `vercel --prod` (dry‑run) | Production build succeeds |
| **6 – Manual QA** | Open app on device; perform signup → booking → analytics flow | Verify UI/UX expectations |

---

## ACCEPTANCE CRITERIA
- [ ] All unit and integration tests pass.
- [ ] No lint/style warnings.
- [ ] E2E flows (signup → edit → save → public page → analytics) work end‑to‑end.
- [ ] Lighthouse performance ≥ 90 on public pages.
- [ ] Application builds and deploys to Vercel without errors.
- [ ] Code follows project conventions (naming, imports, error handling).
- [ ] No regressions in existing functionality.
- [ ] Documentation updated to reflect new modules.

---

## COMPLETION CHECKLIST
- [ ] All tasks listed under each phase executed and validated.
- [ ] Each task includes an executable validation command that passes.
- [ ] No task leaves the checklist pending.
- [ ] Final codebase passes Biome, Vitest, and Vercel build checks.
- [ ] Manual QA confirms the MVP user journey works as expected.
- [ ] Documentation (`README.md`, `PRD.md`, `MEMORY.md`) reflects the final state.

---

## NOTES
- **Risk**: Drag‑and‑drop implementation may require careful state synchronization; mitigate by using `dnd-kit`'s built‑in event persistence and testing via unit tests before E2E.
- **Risk**: Supabase Auth version changes could affect JWT format; isolate auth utils so they can be swapped out.
- **Assumption**: The client will approve the 8‑week timeline and provide any required API keys for Supabase/Google OAuth promptly.
- **Next Step**: Execute the plan in the order presented, validating each step before proceeding to the next phase.
