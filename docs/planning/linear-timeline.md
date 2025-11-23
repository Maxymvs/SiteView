# SiteView 360 - Execution Timeline

**Created:** November 22, 2025
**Updated:** November 23, 2025
**Purpose:** Define the correct order to tackle Linear issues based on actual dependencies
**Total Active Issues:** 30 (MAX-163 to MAX-192)

---

## Why This Document Exists

The original phase labels (Phase 1-6) were conceptual groupings from the Dev Plan, not an execution order. When examined for actual dependencies, several issues were misplaced:

- Route protection was originally in Phase 1 but routes don't exist yet → **Distributed to each portal**
- Roles were in Phase 1 but no role-specific features exist yet → **Moved to Sprint 3**
- Schema issues were labeled "Phase 2" but are the true foundation → **Moved to Sprint 1**
- Schema issues consolidated into single issue (all tables in one `schema.ts` file)

This document provides the **actual build order** based on what depends on what.

---

## Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                         FOUNDATION                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Schema (MAX-163) - All 5 tables in ONE schema.ts        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  CRUD Functions (MAX-164)                                 │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                   │
│  ┌───────────────────────────┼───────────────────────────┐      │
│  │                           │                           │      │
│  ▼                           ▼                           ▼      │
│  Layout (MAX-165)      Roles (MAX-166)           [Seed Data]    │
│                              │                                   │
└──────────────────────────────┼───────────────────────────────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
   OPERATOR PORTAL      CLIENT PORTAL          ADMIN PORTAL
   (MAX-167-174)        (MAX-175-182)          (MAX-183-187)
        │                      │                      │
        └──────────────────────┼──────────────────────┘
                               │
                               ▼
                          QA + POLISH
                        (MAX-188-192)
```

---

## Execution Order

### Sprint 1: Data Foundation

**Goal:** Establish the data layer that everything else depends on.

| Order | Issue | Title | Notes |
|-------|-------|-------|-------|
| 1.1 | MAX-163 | Define complete Convex schema | All 5 tables in one `schema.ts` file |
| 1.2 | MAX-164 | Implement CRUD server functions | Depends on schema |

**Implementation Note:** All 5 tables (clients, projects, visits, photos, projectAssignments) are defined together in a single `convex/schema.ts` file.

**Definition of Done:**
- [ ] All 5 tables defined in `convex/schema.ts`
- [ ] `bunx convex dev` runs without errors
- [ ] Can manually insert test data via Convex dashboard
- [ ] All CRUD functions work (test via Convex dashboard)

---

### Sprint 2: UI Foundation

**Goal:** Build the shell that pages will live in.

| Order | Issue | Title | Notes |
|-------|-------|-------|-------|
| 2.1 | MAX-165 | Create base layout structure | Sidebar, shell, top nav |

**Why now:** Layout doesn't strictly depend on data, but it's more useful to build after you understand the data model. Plus, having CRUD functions lets you display real data in the layout.

**Definition of Done:**
- [ ] Dashboard shell renders
- [ ] Sidebar with placeholder navigation
- [ ] Top nav with user menu (from existing Clerk)
- [ ] Mobile responsive hamburger menu
- [ ] Can navigate between placeholder pages

---

### Sprint 3: Role-Based Auth

**Goal:** Set up user roles before building role-specific portals.

| Order | Issue | Title | Notes |
|-------|-------|-------|-------|
| 3.1 | MAX-166 | Set up role-based authentication | Clerk roles + Convex sync |

**Why now:** We're about to build the Operator Portal which requires the "operator" role. Setting up roles now means we can test them immediately.

**Definition of Done:**
- [ ] Clerk has Admin, Operator, Client roles configured
- [ ] User sync webhook stores role in Convex
- [ ] Can assign roles to test users in Clerk dashboard
- [ ] `ctx.auth.getUserIdentity()` returns role info

---

### Sprint 4: Operator Portal

**Goal:** Enable operators to upload visits. This is the data INPUT flow.

| Order | Issue | Title | Depends On |
|-------|-------|-------|------------|
| 4.1 | MAX-167 | Create Operator dashboard page | Layout, CRUD, Roles |
| 4.2 | MAX-168 | Build New Visit form shell | Dashboard exists |
| 4.3 | MAX-169 | Implement exterior type selector | Form shell exists |
| 4.4 | MAX-170 | Add splat file upload | Form shell exists |
| 4.5 | MAX-171 | Add photo batch upload | Form shell exists |
| 4.6 | MAX-172 | Add YouTube 360 URL input | Form shell exists |
| 4.7 | MAX-173 | Implement visit submission flow | All form parts ready |
| 4.8 | MAX-174 | Add operator view of past visits | Visits exist |

**Parallelization:** Issues 4.3, 4.4, 4.5, 4.6 can be built in parallel - they're independent form sections.

**Seed Data Required:** Before testing, manually create via Convex dashboard:
- 1 test client
- 1 test project linked to client
- Assign your test operator user to the project

**Definition of Done:**
- [ ] Operator can log in and see assigned projects
- [ ] Operator can create a new visit with all media types
- [ ] Files upload to Convex storage successfully
- [ ] Visit appears in database after submission
- [ ] Operator can view their past visits

---

### Sprint 5: Client Portal - Media Components

**Goal:** Build the reusable viewer components before the pages that use them.

| Order | Issue | Title | Notes |
|-------|-------|-------|-------|
| 5.1 | MAX-175 | Build SplatViewer component | Standalone, uses PlayCanvas |
| 5.2 | MAX-176 | Build YouTube 360 embed component | Standalone |
| 5.3 | MAX-177 | Create photo gallery component | Standalone, with lightbox |
| 5.4 | MAX-178 | Build exterior video embed component | Standalone, YouTube/Vimeo |

**Parallelization:** All 4 components can be built in parallel - they have no dependencies on each other.

**Testing Strategy:** Create a `/dev/components` page to test these in isolation before integrating into visit cards.

**Definition of Done:**
- [ ] SplatViewer loads and displays a test .ply file
- [ ] YouTube 360 embed works with test video
- [ ] Photo gallery shows grid + lightbox works
- [ ] Exterior video embed works with YouTube and Vimeo

---

### Sprint 6: Client Portal - Pages

**Goal:** Build the viewing experience for clients.

| Order | Issue | Title | Depends On |
|-------|-------|-------|------------|
| 6.1 | MAX-179 | Create Client dashboard page | Layout, CRUD, Roles |
| 6.2 | MAX-180 | Build Project timeline page | Dashboard exists |
| 6.3 | MAX-181 | Create Visit card component | Timeline exists |
| 6.4 | MAX-182 | Implement visit detail sections | All media components (Sprint 5) |

**Data Required:** At least 1-2 visits created via Operator Portal (Sprint 4).

**Definition of Done:**
- [ ] Client can log in and see assigned projects
- [ ] Client can open project and see timeline
- [ ] Visit cards expand/collapse smoothly
- [ ] All media types render correctly in expanded view
- [ ] Photo gallery opens lightbox

---

### Sprint 7: Admin Portal

**Goal:** Build internal tools for managing data. Lower priority for MVP since you can use Convex dashboard.

| Order | Issue | Title | Depends On |
|-------|-------|-------|------------|
| 7.1 | MAX-183 | Create Admin dashboard | Layout, CRUD, Roles |
| 7.2 | MAX-184 | Build client management UI | Dashboard exists |
| 7.3 | MAX-185 | Build project management UI | Dashboard exists |
| 7.4 | MAX-186 | Implement user assignment | Project mgmt exists |
| 7.5 | MAX-187 | Add visit edit and delete functionality | Projects exist |

**MVP Note:** For initial launch, you can manage data directly via Convex dashboard. Admin Portal is a "nice to have" that makes ongoing operations easier.

**Definition of Done:**
- [ ] Admin can create/edit/delete clients
- [ ] Admin can create/edit/delete projects
- [ ] Admin can assign users to projects
- [ ] Admin can edit/delete visits (fix operator mistakes)

---

### Sprint 8: QA + Polish

**Goal:** Test everything, fix edge cases, polish UI.

| Order | Issue | Title | Focus |
|-------|-------|-------|-------|
| 8.1 | MAX-188 | Test upload edge cases | File handling |
| 8.2 | MAX-189 | Mobile responsive testing | All portals |
| 8.3 | MAX-190 | Add loading states and error handling | UX |
| 8.4 | MAX-191 | Final UI polish | Visual consistency |
| 8.5 | MAX-192 | Verify all route protection | Security |

**Note:** MAX-190 (loading states) could be done incrementally during earlier sprints. The dedicated QA pass ensures nothing was missed.

**Definition of Done:**
- [ ] All upload edge cases handled gracefully
- [ ] Works on mobile devices
- [ ] Loading and error states everywhere
- [ ] Consistent visual design
- [ ] Route protection verified for all roles

---

## Quick Reference: Issue to Sprint Mapping

| Sprint | Issues | Count |
|--------|--------|-------|
| 1: Data Foundation | MAX-163, 164 | 2 |
| 2: UI Foundation | MAX-165 | 1 |
| 3: Auth | MAX-166 | 1 |
| 4: Operator Portal | MAX-167, 168, 169, 170, 171, 172, 173, 174 | 8 |
| 5: Client Components | MAX-175, 176, 177, 178 | 4 |
| 6: Client Pages | MAX-179, 180, 181, 182 | 4 |
| 7: Admin Portal | MAX-183, 184, 185, 186, 187 | 5 |
| 8: QA + Polish | MAX-188, 189, 190, 191, 192 | 5 |
| **Total** | | **30** |

---

## Critical Path

The minimum path to a working demo:

```
Schema (MAX-163) → CRUD (MAX-164) → Layout (MAX-165) → Roles (MAX-166) →
Operator Dashboard (MAX-167) → New Visit Form (MAX-168-173) →
Client Dashboard (MAX-179) → Timeline (MAX-180) → Visit Card (MAX-181) + Media Components (MAX-175-178)
```

**Minimum issues for demo:** 20 issues (Sprints 1-6, excluding MAX-174)

---

## Blockers & Risks

| Risk | Mitigation |
|------|------------|
| SplatViewer (MAX-175) is complex | Start early, have video fallback ready |
| Large file uploads may fail | Implement retry logic in MAX-170 |
| Role setup confusion | Test thoroughly in Sprint 3 before building portals |
| No test data | Seed data manually via Convex dashboard |

---

## What Changed from Original Planning

This timeline was created after deleting all original issues and re-creating them with proper dependency ordering. Key changes:

| Change | Reason |
|--------|--------|
| Route protection distributed to portals | Each portal (MAX-167, MAX-179, MAX-183) handles its own route protection |
| Roles moved to Sprint 3 | Roles needed right before first portal |
| Schema consolidated to 1 issue | All 5 tables belong in single `schema.ts` file |
| Media components before pages | Sprint 5 builds components, Sprint 6 uses them |

---

## Start Here

**Your first task:** Sprint 1 (MAX-163 + MAX-164)

```bash
# Create branch
git checkout -b maxym/max-163-database-schema

# Work on convex/schema.ts
# Add all tables: clients, projects, visits, photos, projectAssignments

# Then implement CRUD in convex/ folder
# Test via Convex dashboard

# Commit and move to Sprint 2
```

---

## References

- [Linear Project](https://linear.app/maxym-me/project/siteview-6cbc4487)
- [PRD](./planning/siteview_360_prd.md)
- [Dev Plan](./planning/siteview_360_dev_plan.md)
- [Planning Summary](./linear-planning-summary.md)
