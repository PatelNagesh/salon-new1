# Product Requirements Document: Salon Management App

## 1. Executive Summary
The salon management application is a multi‑role, SaaS‑style platform that automates core salon workflows—appointments, staff scheduling, inventory, payments (deferred to later phases), and analytics—across salon locations. The MVP will deliver a complete experience for **Super Admin**, **Salon Owner**, **Staff**, **Customer**, and limited **Vendor** interactions, enabling owners to run their salons efficiently while providing a modern, mobile‑first UI built with React Native.

**Core Value Proposition**
- Unified hub for booking, staff management, inventory, and reporting.
- Role‑based access control (RBAC) with tenant‑level data isolation.
- Scalable architecture that supports multi‑branch salons from day one.

**MVP Goal**
Enable a salon owner to manage services, staff, appointments, and basic inventory within a single mobile app, with a live preview of the UI and role‑specific navigation, all backed by a Supabase database.

---

## 2. Mission
**Mission Statement:**
Provide salon owners and their teams with an intuitive, self‑hosted mobile solution that replaces fragmented tools (paper schedules, spreadsheets, separate POS systems) with a single, secure, and scalable platform they fully control.

**Core Principles**
1. **Simplicity First** – Users should be able to create, edit, and publish schedule changes in under two minutes.
2. **Visual Quality** – UI components adopt a native‑look with smooth animations (Reanimated) and consistent theming.
3. **Performance** – Server‑side rendered public pages and API responses must load under 1 s on typical mobile networks.
4. **Self‑Service** – No admin intervention required; owners manage their own salon data.
5. **Test‑Driven Confidence** – Every user journey is covered by E2E tests; no feature ships without comprehensive test coverage.

---

## 3. Target Users
| Persona | Technical Comfort | Key Needs |
|---------|-------------------|-----------|
| **Super Admin** | Medium‑High | Platform‑wide policy setting, global analytics, multi‑tenant configuration, user management across all branches. |
| **Salon Owner** | Medium | Full control of salon operations—staff schedules, service pricing, inventory, appointment calendar, basic analytics. |
| **Staff** | Low‑Medium | View personal schedule, update appointment status, log check‑ins, basic performance metrics. |
| **Customer** | Low | Browse services, book appointments, view history, receive confirmations. |
| **Vendor** (limited MVP) | Medium | View inventory requests from the salon, update stock/delivery status. |

All users require **tenant‑aware** data isolation (every table includes `salon_id`).

---

## 4. MVP Scope
### ✅ In Scope
**Core Functionality**
- 📅 **Booking & Scheduling** – Customers book services; owners/staff manage shifts.
- 👩‍⚕️ **Staff Management** – Owner adds/staff, assigns shifts, staff view own schedule.
- 📚 **Service Catalog** – Browse/list services with descriptions, durations, prices.
- 🎨 **Theme‑Based UI** – Four visual themes (Minimal, Dark, Colorful, Professional) with instant preview.
- 📊 **Basic Analytics** – Dashboard showing bookings per day, revenue per service (simple totals).
- 🔐 **RBAC & Multi‑Tenant Isolation** – Role‑based access, `salon_id` on every record.
- 🔄 **React Navigation** – Role‑based stacks (`AuthStack`, `OwnerStack`, `StaffStack`, `CustomerStack`, `AdminStack`).
- 🧱 **Feature‑Based Modular Structure** – `core/`, `modules/`, `shared/` layout.
- 🧪 **Testing Foundations** – Vitest unit tests for utilities, agent‑browser E2E for critical flows.

**Technical**
- 🛠️ **Supabase** – Database, authentication, and real‑time capabilities.
- 📦 **NativeWind** + **TailwindCSS** – Utility‑first styling, framework‑less setup.
- 🪝 **Dnd‑Kit** – Drag‑and‑drop reordering of links/bookings.
- 🧭 **React Query** – Data fetching & caching.

**Deployment**
- 🚀 **Vercel** – Hosting & CI/CD (future phases may move to custom infra).
- 🔐 **Environment‑Based Configuration** – `.env` + Vercel secrets.

### ❌ Out of Scope (Phase 2+)
- 💳 Payment processing & loyalty programs.
- 📦 Advanced inventory purchase orders.
- 📈 Deep analytics (geo‑analytics, cohort analysis).
- 📱 Dedicated web portal for admin across all branches.
- 📅 Appointment reminders via push notifications.
- 🧑‍💼 Role‑specific admin panels (e.g., multi‑branch oversight).

---

## 4. User Stories
### Registration & Authentication
- **US‑1:** As a new user, I want to sign up with email/password or Google OAuth and choose a unique slug, so that I obtain a personal salon URL (`/slug`).
- **US‑2:** As a returning user, I want to log in via email/password or Google, so that I can access my dashboard instantly.

### Profile & Service Management
- **US‑3:** As a logged‑in owner, I want to edit my salon’s name, bio, avatar, and theme, so that the public page reflects my brand.
- **US‑4:** As a staff member, I want to view my assigned appointments and update their status, so that I can manage my workload.
- **US‑5:** As an owner, I want to add, edit, reorder, or delete services, headers, and dividers, so that the service catalog matches my offerings.

### Public Pages & SEO
- **US‑6:** As a visitor, I want to view a salon’s public page at `/<slug>` with SEO‑friendly meta tags, so that I can share it on social platforms.
- **US‑7:** As a visitor, I want to click a service link and be redirected to the target site while the click is recorded, so that the owner can track popularity.

### Analytics
- **US‑8:** As an owner, I want to see a dashboard with total bookings, revenue per service, and a time‑series chart, so that I can assess business health.
- **US‑9:** As an owner, I want to filter analytics by date range (7 d, 30 d, 90 d), so that I can focus on recent trends.

---

## 5. Core Architecture & Patterns
### High‑Level Diagram
```
┌───────────────────────────────────────────────────────┐
│                     Vercel (Hosting)                │
│  ┌───────────────────────┐   ┌─────────────────────┐ │
│  │   Next.js App Router  │   │   Supabase (DB +   │ │
│  │   - (auth)/           │   │   Auth)            │ │
│  │   - (owner)/          │   └─────────────────────┘ │
│  │   - (staff)/          │                               │
│  │   - (customer)/       │   ┌─────────────────────┐ │
│  │   - [slug] (SSR)      │   │   React Native      │ │
│  │                       │   │   CLI App           │ │
│  └───────────────────────┘   └─────────────────────┘ │
└───────────────────────────────────────────────────────┘
```
### Directory Structure
```
salon_rn_project/
├─ core/            # Shared utilities, config, supabase client
├─ modules/         # Feature modules (booking, staff, inventory, analytics)
├─ shared/          # UI primitives, theme, styling, reutilized hooks
├─ src/             # All source code (generated by CLI)
│   ├─ components/
│   ├─ screens/
│   └─ navigation/
├─ navigation/      # React Navigation stacks per role
├─ store/           # Zustand store for global UI state
└─ types/           # TypeScript shared types
```
### Design Patterns
1. **Route Groups** – `(owner)`, `(staff)`, `(customer)` for layout isolation.
2. **Server‑first** – All public pages are Server Components; only interactive parts are Client Components.
3. **Server Actions** – Mutations (profile save, link reorder) are performed via Server Actions.
4. **Drag‑and‑Drop** – `dnd-kit` for reordering services/staff assignments.
5. **RBAC Middleware** – Guard routes based on role stored in JWT.
6. **Modular Feature Slicing** – Each functional area lives in its own folder under `modules/`.

---

## 6. Tools / Features
- **Navigation:** React Navigation with role‑specific stacks.
- **State Management:** React Query for server state, Zustand for client‑side UI state.
- **UI Component Library:** NativeWind + shadcn/ui (framework‑less).
- **Drag‑and‑Drop:** `dnd-kit` for reordering services/staff.
- **Analytics:** Recharts for time‑series charts.
- **Testing:** Vitest for unit tests; agent‑browser for E2E flows.

---

## 7. Technology Stack
| Layer | Technology | Version/Notes |
|-------|------------|----------------|
| **Framework** | React Native CLI | Latest (TypeScript template) |
| **Styling** | NativeWind (Tailwind‑compatible) | Framework‑less setup |
| **UI Components** | shadcn/ui | Accessible, customizable |
| **Database** | Supabase (PostgreSQL) | Real‑time, Row Level Security |
| **Auth** | Supabase Auth (or Neon Auth in future) | JWT + OAuth |
| **ORM** | Drizzle ORM | Type‑safe queries |
| **ORM Schema** | TypeScript types generated via `supabase gen types typescript` |
| **Testing** | Vitest (unit), agent‑browser (E2E) | Coverage >90% on core flows |
| **Linting/Formatting** | Biome | Zero lint warnings |
| **Deployment** | Vercel (CI/CD) | Automatic builds on push |
| **Environment Variables** | `.env` + Vercel Secrets | `DATABASE_URL`, `SUPABASE_URL`, etc. |

---

## 8. Security & Configuration
- **Authentication** – Supabase Auth (email/password + Google OAuth). Sessions stored in secure httpOnly cookies.
- **Authorization** – Row‑level security policies enforce `salon_id` checks; API routes verify role before mutating data.
- **Rate Limiting** – In‑memory limiter on `/api/click` (60 req/min/IP) and login endpoints.
- **Input Validation** – Zod schemas for all incoming payloads.
- **Environment Variables** – Stored in `.env` (local) and Vercel (prod). Never commit secrets.
- **Data Isolation** – Every table includes `salon_id`; policies enforce it on reads/writes.

---

## 9. Database Schema (SQL)
```sql
CREATE TABLE profiles (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       TEXT NOT NULL UNIQUE REFERENCES neon_auth.users(id) ON DELETE CASCADE,
  salon_id      TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  display_name  TEXT NOT NULL,
  bio           TEXT NOT NULL DEFAULT '',
  avatar_url    TEXT NOT NULL DEFAULT '',
  theme         TEXT NOT NULL DEFAULT 'minimal',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX idx_profiles_slug ON profiles(slug);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

CREATE TABLE services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  description   TEXT,
  duration_min  INTEGER NOT NULL,
  price_cents   INTEGER NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_services_profile_id ON services(profile_id);

CREATE TABLE bookings (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  service_id    UUID REFERENCES services(id),
  start_time    TIMESTAMPTZ NOT NULL,
  end_time      TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_bookings_profile_id ON bookings(profile_id);
CREATE INDEX idx_bookings_service_id ON bookings(service_id);
```
*All tables contain a `salon_id` column for multi‑tenant isolation.*

---

## 10. API Specification
### Auth
- `POST /api/auth/signup` – `{email, password, slug}` → returns JWT.
- `POST /api/auth/signin` – `{email, password}` or `{googleToken}`.

### Profiles
- `GET /api/profile` – Get current profile + services.
- `PUT /api/profile` – Update `display_name`, `bio`, `avatar_url`, `theme`.

### Services
- `GET /api/services` – List services for the salon.
- `POST /api/services` – Add new service.
- `PUT /api/services/[id]` – Update service.
- `DELETE /api/services/[id]` – Remove service.

### Bookings
- `GET /api/bookings` – List bookings for the profile.
- `POST /api/bookings` – Create a new booking (requires service_id, start_time).
- `PUT /api/bookings/reorder` – Reorder staff assignments (payload: `[{id, sortOrder}]`).
- `PUT /api/bookings/[id]/status` – Update booking status.

### Click Tracking
- `POST /api/click` – `{linkId}` – Record a click; rate‑limited (60/min/IP).

### Analytics
- `GET /api/analytics?period=30d` – Summary cards, top links, time‑series data.

All endpoints enforce authentication where required; public click endpoint is open.

---

## 11. Success Criteria
- **Functional**: All MVP user stories implemented and passing E2E tests.
- **Performance**: Public pages load < 1 s on 3G; UI transitions < 200 ms.
- **Quality**: TypeScript strict mode with 0 type errors; Biome passes with 0 lint warnings.
- **Adoption**: Owner can create, edit, and publish a public page within 2 min of signup.
- **Retention**: 80% of owners complete onboarding without assistance (measured via in‑app analytics).

---

## 12. Implementation Phases
### Phase 1 – Foundations (2 weeks)
- ✅ Project scaffolding (React Native CLI + TypeScript)
- ✅ Supabase project + Drizzle schema + migrations
- ✅ Neon Auth integration (email/password + Google OAuth)
- ✅ Navigation skeleton (role‑based stacks)
- ✅ CI/CD pipeline (Vercel)

### Phase 2 – Core Editor (3 weeks)
- ✅ Profile editor (name, bio, avatar)
- ✅ Service catalog (CRUD + drag‑and‑drop)
- ✅ Theme picker with live preview
- ✅ Save button with toast feedback
- ✅ Unit & E2E tests for all flows

### Phase 3 – Public Pages & SEO (2 weeks)
- ✅ Dynamic `[slug]` SSR route
- ✅ OG meta tags injection
- ✅ Marketing landing page (`/`)
- ✅ 404 handling & reserved‑slug protection

### Phase 4 – Analytics (2 weeks)
- ✅ Click tracking endpoint + rate limiting
- ✅ Dashboard UI (summary cards, top links, time‑series)
- ✅ Period filtering (7d/30d/90d)
- ✅ E2E tests for click flow

### Phase 5 – Polish & Launch (1 week)
- ✅ Performance audits (Lighthouse ≥ 90)
- ✅ Bug‑fix sprint
- ✅ Deploy to production

**Total MVP Timeline:** ~8 weeks

---

## 13. Future Considerations
- **Payments & Loyalty** – Integrate Stripe/PayPal and points system (Phase 2).
- **Multi‑Branch Management** – Admin view across salons (Phase 3).
- **Custom Domains** – Allow owners to map personal domains (Phase 3).
- **Advanced Analytics** – Geo‑analytics, cohort analysis (Phase 4).
- **File Uploads** – Avatar image storage (Cloudflare R2) (Phase 4).
- **Team Accounts** – Multi‑user collaboration for large salons (Phase 5).

---

## 14. Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Supabase Auth is newer; limited community examples. | Medium | Leverage Better Auth docs; isolate auth logic for easy swapping. |
| High click volume could overload DB. | Medium | Rate‑limit aggressively; batch writes if needed; rely on Supabase auto‑scaling. |
| Slug collisions with system routes. | High | Maintain strict reserved‑slug list; place `[slug]` route at the end of routing stack. |
| Drag‑and‑drop layout complexity across themes. | Medium | Start with shared base components; define clear `ThemeProps` interface. |
| E2E flakiness with auth and drag‑and‑drop. | Medium | Use deterministic waits; isolate drag‑and‑drop tests to the reorder API; run in clean Docker containers. |

---

## 15. Appendix
- **Related Documents:**
  - `.claude/.agents/AGENT.md` – Agent behavior rules.
  - `.claude/.agents/reference/documents.md` – List of reference docs.
  - `.claude/.agents/reference/api.md` – API contract summary.
  - `.claude/.agents/reference/compnets.md` – Component spec overview.
  - `.claude/.agents/reference/git-check.md` – Git workflow checklist.

- **Key Dependencies:** Next.js 15, React 19, NativeWind, shadcn/ui, Supabase, Drizzle ORM, Biome, Vitest, agent‑browser.

- **Repository Structure:** See `ARCHITECTURE.md` in the root for a diagram.

---

*Generated on 2026‑03‑31*