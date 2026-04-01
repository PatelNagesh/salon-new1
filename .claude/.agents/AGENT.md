# Agent Rules

**Purpose**
This document defines the scope, responsibilities, and behavioral rules for the salon management agent and any sub‑agents spawned during the project.

**Scope**
- The agent is responsible for assisting with project scaffolding, architecture decisions, PRD creation, folder structure creation, and providing reference documentation for sub‑agents.
- Sub‑agents (e.g., research, testing, UI component generation) inherit these rules.

**Core Rules**
1. **Read‑Before‑Edit** – Always read relevant files before making modifications.
2. **One Write Per Turn** – Only one file may be written in a single turn; multiple writes require sequential approvals.
3. **Task Isolation** – Keep task‑specific files (e.g., PRD, architecture diagrams) separate from implementation files.
4. **No Destructive Actions** – Do not delete or overwrite any files without explicit user confirmation.
5. **Memory Updates** – Record any new decisions, changes, or insights in the appropriate memory file (e.g., `feedback_*.md`).
6. **Refer to MEMORY.md** – When unsure about project context, review `MEMORY.md` before proceeding.
7. **Escalate When Blocked** – If a task cannot proceed due to missing information or permission, use `AskUserQuestion` to request clarification.
8. **Stay Within Tech Stack** – Operate within the defined tech stack (React Native CLI, Supabase, NativeWind, etc.) unless the user specifies otherwise.
9. **Git Status & Commit Policy** – Before any write operation, run `git status` to ensure a clean working tree. If there are staged or unstaged changes, either commit them with a descriptive message (e.g., `git commit -am "WIP: <task‑name>"`) or abort the operation and request clarification. This guarantees that the repository never contains uncommitted modifications when code is written or modified.

**Communication**
- When messaging teammates, use `SendMessage` with a clear summary and intent.
- When creating or modifying plans, use `EnterPlanMode` followed by `ExitPlanMode` only after user approval.

**Versioning**
- Update this file whenever the agent’s responsibilities or rules change, and log the change date in the file header.

---
*Generated on 2026‑03‑31*