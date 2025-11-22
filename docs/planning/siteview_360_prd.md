# SiteView 360 – MVP Product Requirements Document

## 1. Product Overview
SiteView 360 is a simple, fast, and highly visual progress‑tracking platform for custom home construction. It offers homeowners and builders an objective, timestamped record of the build using exterior drone captures (Gaussian splats or flythrough videos), indoor 360° walkthroughs, and high‑detail photo documentation.

The goal is not to replace construction management tools—it's to provide a visual history of the project so clients see progress clearly and builders avoid disputes.

---

## 2. MVP Goals
- Deliver a clean visual timeline that shows progress over time.
- Make uploads simple for the operator.
- Support flexible exterior capture formats (splat or drone video).
- Use simple, proven embedding tech (SuperSplat + YouTube 360).
- Validate that builders pay for recurring visits.

---

## 3. User Roles
### Client / Homeowner
Wants clarity, transparency, and easy progress visualization.

### Builder / Contractor
Wants fewer disputes, fewer calls, and strong documentation to show clients.

### Operator (You or hired technician)
Captures data on site, uploads it quickly, and needs minimal tooling.

---

## 4. Core Features

### 4.1 Project Timeline (Client Portal)
A single scrollable timeline of site visits. Each visit includes:
- Exterior View (Splat or Flythrough Video)
- Interior 360 Tour (YouTube 360 embed)
- Detail Photo Gallery (2–20 images)
- Notes
- Timestamp

Users click a visit to expand it and explore its media.

---

### 4.2 Exterior View Options
Each visit supports **one** of two exterior formats.

#### Option A: Gaussian Splat (Primary Exterior Format)
- Hosted as .ply or .sog files
- Displayed using SuperSplat viewer

#### Option B: Exterior Flythrough Video (Fallback / Simpler Option)
- YouTube or Vimeo embed
- Ideal when splat is unnecessary or conditions aren’t ideal

---

### 4.3 Interior 360 Tour
- 360° walkthrough recorded via 360 camera
- Uploaded to YouTube as unlisted
- Embedded in the visit entry
- No custom hotspots or mapping required for MVP

---

### 4.4 Detail Photo Gallery
- Grid of high‑resolution photos
- Lightbox viewer with zoom
- Optional metadata:
  - Caption
  - Category (plumbing, electrical, framing, general)

Stored via Convex file storage and displayed with standard image components.

---

### 4.5 Operator Portal
A minimal uploader interface.

Operators can:
- Select a project
- Create a new visit
- Choose exterior format:
  - Upload splat file
  - OR paste exterior flythrough video URL
- Paste YouTube 360 link
- Upload detail photos
- Add notes
- Submit

Visits appear instantly in the client timeline.

---

## 5. Technical Architecture
### Frontend
- Next.js + React
- SuperSplat viewer
- YouTube iframe embeds
- Photo gallery component

### Backend
- Convex: database, actions, file storage
- Clerk: authentication

### Data Model
**Clients**: id, name, email

**Projects**: id, client_id, name, address

**Visits**: id, project_id, date, notes, exterior_type ("splat" | "video"), splat_url, video_url, youtube_360_url

**Photos**: id, visit_id, file_url, caption, category

---

## 6. MVP Flow
### Operator
1. Capture drone + 360 footage
2. Process splat manually if needed
3. Upload splat or video URL
4. Upload detail photos
5. Add notes
6. Publish

### Client
1. Open project link
2. Scroll timeline
3. Expand visit
4. View splat or video, interior 360, and photo gallery

---

## 7. Non‑Goals (Outside MVP)
- Automated splat generation
- Operator marketplace
- Liability modules
- LAANC integration
- Annotations or measurements
- BIM integrations
- Mobile app
- AI analysis or auto‑diff

These are future‑phase features.

---

## 8. Pricing Model (MVP)
### Standard Visit – $650
- Exterior video
- Interior 360
- Detail photos
- Timeline entry

### Premium Visit – $950+
- Exterior Gaussian Splat
- Interior 360
- Detail photos
- Timeline entry

---

## 9. Success Criteria
MVP is successful if:
- Builders request repeat visits
- Clients check timelines without needing support
- 3–5 builders pay for multiple projects
- Operators complete uploads reliably and quickly

---

## 10. Post‑MVP Roadmap
### Phase 2
- Before/After comparison slider
- Notes/comments on media
- Automated resizing or thumbnailing

### Phase 3
- Operator network onboarding
- AI‑driven change detection
- Vision Pro viewer
- Self‑hosted splat pipeline

---

This version trims scope to what can be built quickly while delivering the full core value proposition.

