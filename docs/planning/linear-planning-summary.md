# SiteView 360 - Linear Planning Summary

**Created:** November 22, 2025
**Updated:** November 23, 2025
**Status:** Planning Complete - Ready for Development
**Linear Project:** [SiteView](https://linear.app/maxym-me/project/siteview-6cbc4487)

---

## Overview

This document summarizes the planning process for the SiteView 360 MVP, including the analysis of requirements, Linear issue creation, and final verification.

**Important:** This is the second iteration of planning. The original Phase-based issues were deleted and replaced with Sprint-based issues after identifying dependency problems in the original ordering.

---

## Source Documents Analyzed

### 1. Product Requirements Document (`docs/planning/siteview_360_prd.md`)
- Defines the product vision: visual progress tracking for custom home construction
- Specifies 3 user roles: Client/Homeowner, Builder/Contractor, Operator
- Core features: Project Timeline, Exterior Views (Splat/Video), Interior 360, Photo Gallery
- Data model: clients, projects, visits, photos
- Pricing model: Standard ($650) and Premium ($950+) visits

### 2. Development Plan (`docs/planning/siteview_360_dev_plan.md`)
- 6-phase implementation plan (6-10 weeks)
- Detailed SplatViewer component specification
- Tech stack: Next.js, React, Tailwind, Convex, Clerk
- Risk mitigation strategies
- Milestone definitions

### 3. Billing Future Plans (`docs/planning/billing-future-plans.md`)
- Billing deferred to post-MVP
- Options documented: Clerk Billing vs Polar.sh
- Migration strategy outlined for future implementation

### 4. Project Configuration (`AGENTS.md`)
- Existing skeleton app with Next.js 15, React 19, TypeScript
- Clerk authentication already configured
- Convex backend connected
- Tailwind v4 styling in place

---

## Linear Issue Structure

### Sprint Labels Created

| Label | Color | Focus Area |
|-------|-------|------------|
| Sprint 1: Data Foundation | Blue (#4EA7FC) | Schema + CRUD |
| Sprint 2: UI Foundation | Purple (#5E6AD2) | Layout Shell |
| Sprint 3: Auth | Green (#0F783C) | Role-Based Auth |
| Sprint 4: Operator Portal | Orange (#F2994A) | Upload Flow |
| Sprint 5: Client Components | Cyan (#26B5CE) | Media Viewers |
| Sprint 6: Client Pages | Teal (#0D9488) | Client Portal |
| Sprint 7: Admin Portal | Yellow (#F2C94C) | Admin Tools |
| Sprint 8: QA + Polish | Red (#EB5757) | Testing + Polish |

### Issue Breakdown by Sprint

#### Sprint 1: Data Foundation (2 issues)
| ID | Title |
|----|-------|
| MAX-163 | Define complete Convex schema |
| MAX-164 | Implement CRUD server functions |

#### Sprint 2: UI Foundation (1 issue)
| ID | Title |
|----|-------|
| MAX-165 | Create base layout structure |

#### Sprint 3: Auth (1 issue)
| ID | Title |
|----|-------|
| MAX-166 | Set up role-based authentication |

#### Sprint 4: Operator Portal (8 issues)
| ID | Title |
|----|-------|
| MAX-167 | Create Operator dashboard page |
| MAX-168 | Build New Visit form shell |
| MAX-169 | Implement exterior type selector |
| MAX-170 | Add splat file upload |
| MAX-171 | Add photo batch upload |
| MAX-172 | Add YouTube 360 URL input |
| MAX-173 | Implement visit submission flow |
| MAX-174 | Add operator view of past visits |

#### Sprint 5: Client Components (4 issues)
| ID | Title |
|----|-------|
| MAX-175 | Build SplatViewer component |
| MAX-176 | Build YouTube 360 embed component |
| MAX-177 | Create photo gallery component |
| MAX-178 | Build exterior video embed component |

#### Sprint 6: Client Pages (4 issues)
| ID | Title |
|----|-------|
| MAX-179 | Create Client dashboard page |
| MAX-180 | Build Project timeline page |
| MAX-181 | Create Visit card component |
| MAX-182 | Implement visit detail sections |

#### Sprint 7: Admin Portal (5 issues)
| ID | Title |
|----|-------|
| MAX-183 | Create Admin dashboard |
| MAX-184 | Build client management UI |
| MAX-185 | Build project management UI |
| MAX-186 | Implement user assignment |
| MAX-187 | Add visit edit and delete functionality |

#### Sprint 8: QA + Polish (5 issues)
| ID | Title |
|----|-------|
| MAX-188 | Test upload edge cases |
| MAX-189 | Mobile responsive testing |
| MAX-190 | Add loading states and error handling |
| MAX-191 | Final UI polish |
| MAX-192 | Verify all route protection |

---

## Why Sprints Instead of Phases

The original Phase-based planning had dependency issues:

| Problem | Original | Solution |
|---------|----------|----------|
| Route protection too early | Phase 1 had MAX-130 (route protection) but routes didn't exist | Distributed to each portal issue |
| Roles before features | Phase 1 had roles but no role-specific features yet | Moved to Sprint 3, right before Operator Portal |
| Schema not first | Schema was in Phase 2, but is the true foundation | Moved to Sprint 1 |
| Components mixed with pages | Media components were in same phase as pages | Sprint 5 = components, Sprint 6 = pages |

**Key Insight:** Build order should follow dependencies, not conceptual groupings.

---

## Coverage Verification

### PRD Feature Coverage

| PRD Feature | Covered By |
|-------------|------------|
| Project Timeline viewer | MAX-180 |
| Visit entries with expand/collapse | MAX-181, MAX-182 |
| Exterior Gaussian Splat viewer | MAX-175 |
| Exterior Flythrough Video | MAX-178 |
| Interior 360 YouTube embed | MAX-176 |
| Photo gallery with lightbox | MAX-177 |
| Operator upload portal | MAX-167 to MAX-174 |
| Client/Homeowner portal | MAX-179 to MAX-182 |
| Admin tools | MAX-183 to MAX-187 |
| Role-based authentication | MAX-166 |
| Route protection | MAX-167, MAX-179, MAX-183, MAX-192 |

### Data Model Coverage

| Table | Covered By |
|-------|------------|
| clients | MAX-163 (schema), MAX-164 (CRUD) |
| projects | MAX-163 (schema), MAX-164 (CRUD) |
| visits | MAX-163 (schema), MAX-164 (CRUD) |
| photos | MAX-163 (schema), MAX-164 (CRUD) |
| projectAssignments | MAX-163 (schema), MAX-164 (CRUD) |

---

## Issue Quality Standards

Each issue includes:
- **Sprint label** for visual organization
- **Issue number** (e.g., "Issue 3 of 8") for tracking progress
- **Depends on** section noting prerequisites
- **Detailed description** with context and requirements
- **Actionable checklist** with specific tasks
- **Code examples** where helpful (TypeScript interfaces, schema definitions)
- **Definition of Done** criteria
- **Reference links** to PRD and Dev Plan sections

---

## Statistics

| Metric | Count |
|--------|-------|
| Total Issues | 30 |
| Sprint 1 Issues | 2 |
| Sprint 2 Issues | 1 |
| Sprint 3 Issues | 1 |
| Sprint 4 Issues | 8 |
| Sprint 5 Issues | 4 |
| Sprint 6 Issues | 4 |
| Sprint 7 Issues | 5 |
| Sprint 8 Issues | 5 |

---

## Next Steps

1. **Begin Sprint 1** - Start with MAX-163 (schema) + MAX-164 (CRUD)
2. **Work sequentially** - Complete each sprint before moving to the next
3. **Track in Linear** - Move issues through Backlog → In Progress → Done
4. **Use branch naming** - Each issue has a suggested git branch name
5. **Test incrementally** - Use Convex dashboard to verify data operations

---

## Critical Path to Demo

```
Schema (MAX-163) → CRUD (MAX-164) → Layout (MAX-165) → Roles (MAX-166) →
Operator Dashboard (MAX-167) → New Visit Form (MAX-168-173) →
Client Dashboard (MAX-179) → Timeline (MAX-180) → Visit Card (MAX-181) + Media Components (MAX-175-178)
```

**Minimum issues for working demo:** 20 issues (Sprints 1-6, excluding MAX-174)

---

## Notes

- **Billing deferred** - Focus on core product features first (see `billing-future-plans.md`)
- **Existing foundation** - App skeleton already exists; Sprint 1 builds on it
- **SplatViewer** - Uses SuperSplat/PlayCanvas React API for Gaussian splat rendering
- **Video distinction** - MAX-176 handles interior 360 tours, MAX-178 handles exterior flythrough videos
- **Route protection** - Distributed to each portal rather than centralized

---

## References

- [SiteView Linear Project](https://linear.app/maxym-me/project/siteview-6cbc4487)
- [Execution Timeline](./linear-timeline.md) - Detailed sprint breakdown with dependencies
- [PRD](./siteview_360_prd.md)
- [Development Plan](./siteview_360_dev_plan.md)
- [Billing Plans](./billing-future-plans.md)
