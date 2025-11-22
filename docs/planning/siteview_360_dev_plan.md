# SiteView 360 – Development Implementation Plan (MVP)

## 1. Objective
Build a fully functional MVP of SiteView 360 within 6–10 weeks, focusing on:
- Project timeline viewer
- Visit entries
- Exterior view (splat or video)
- Interior 360 embed
- Photo gallery
- Operator upload portal
- Basic authentication and client access

This is a lean, execution-focused plan with clear engineering tasks, milestones, and responsibilities.

---

## 2. Tech Stack Overview
**Frontend:** Next.js, React, Tailwind

**Backend:** Convex (database, file storage, server functions)

**Auth:** Clerk

**Media Viewers:**
- SuperSplat Viewer (splat files)
- YouTube iframe (360 videos)
- React Lightbox / custom lightbox (photo viewer)

---

## 3. High-Level Architecture
### Client Portal
- Project list
- Project timeline
- Visit details
- Embedded media components

### Operator Portal
- Login
- Project selection
- Upload form (splat OR video + 360 video + photos)
- Submit visit

### Admin (You)
- Create clients
- Create projects
- Manage access

---

## 4. Implementation Phases

## Phase 1 – Foundations (Week 1)
### Tasks
- Set up Next.js project
- Integrate Tailwind
- Install and configure Clerk
- Set up Convex project and connect it to frontend
- Create basic layout and routing structure

### Deliverables
- Running skeleton app
- Auth working for Admin, Operator, Client roles

---

## Phase 2 – Database + API Layer (Week 2)
### Convex Schema
Implement tables:
- clients
- projects
- visits
- photos

### Server Functions
- createClient
- createProject
- createVisit
- uploadPhoto
- listProjects
- listVisits
- getVisit

### Deliverables
- Full data model implemented
- Basic CRUD available for testing

---

## Phase 3 – Operator Portal (Weeks 3–4)
### UI Components
- Operator dashboard: list available projects
- "New Visit" form

### Upload Features
- Select exterior type: splat or video
- Upload splat file → Convex direct upload URL
- Paste exterior video URL
- Paste YouTube 360 URL
- Drag/drop photo upload
- Notes field
- Submit visit

### Deliverables
- Fully working operator upload pipeline
- Data stored correctly in Convex

---

## Phase 4 – Client Portal (Weeks 4–6)
### Pages
1. Client dashboard (list projects)
2. Project timeline page
3. Visit detail sections

### Components
- Timeline listing
- Visit card expanding/contracting
- SuperSplat viewer component
- YouTube iframe component
- Photo gallery + lightbox view

### Deliverables
- Client can log in, open project, scroll timeline, and view all media

---

## Phase 5 – Admin Tools (Week 6)
### Features
- Admin dashboard
- Create client
- Create project
- Assign users

### Deliverables
- Minimal internal tools for managing clients and projects

---

## Phase 6 – QA + Polish (Weeks 7–8)
### Tasks
- Test upload edge cases
- Test splat viewer performance
- Mobile testing
- Error states
- Loading placeholders
- Final UI polish

### Deliverables
- MVP stable and ready for real builders

---

## 5. Detailed Task Breakdown

### Frontend
- Layout structure: sidebar, dashboard, timeline
- Auth flows (Admin, Operator, Client)
- Project cards
- Visit cards with conditional media rendering
- Components: inputs, uploaders, lightbox, modals
- SuperSplat integration
- Image gallery integration

### Backend (Convex)
- Schema + indexes
- Access control rules
- File storage functions
- Visit creation pipeline
- Data fetchers for timeline

### Operator Features
- Large file upload via direct upload URL
- URL parsing and validation
- Photo batch upload
- Form autosave (optional)

### Client Features
- Clean, frictionless viewing experience
- Media load optimization
- Responsive design

---

## 6. Milestones
### Milestone 1 – Week 2
Auth + backend schema complete

### Milestone 2 – Week 4
Operator Portal MVP functional

### Milestone 3 – Week 6
Client Portal fully functional

### Milestone 4 – Week 8–10
Testing, refinement, first real client onboarded

---

## 7. Risks & Mitigation
### Large files (splat + photos)
Mitigation: Convex direct uploads, file-size limits

### Splat viewer performance
Mitigation: fallback message, pre-rendered orbit videos

### Operator inconsistency
Mitigation: simple, clear upload workflow

### Builders not returning
Mitigation: focus on early sales conversations during MVP build

---

## 8. Deployment Plan
- Vercel hosting for frontend
- Convex cloud deployment
- Custom domain mapping
- SSL/HTTPS via Vercel
- Staging + production environments

---

## 9. Post-MVP Enhancements
- Compare slider
- Inline notes on media
- Project-level share links
- AI change detection
- Self-hosted splat processing
- Vision Pro native viewer

---

This development plan is structured to get you to real builders as fast as possible while keeping your MVP clean and achievable.

