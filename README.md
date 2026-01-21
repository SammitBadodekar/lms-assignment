# Learning Path Management System

A full-stack learning path management application built with Next.js 16 and MongoDB. Users can view assigned learning paths, complete modules sequentially, and track their progress.

**Live Demo:** https://lms-assignment-mu.vercel.app

## Features

- Email/password authentication
- Dashboard showing all assigned learning paths with progress
- Path detail page with module content renderer
- Sequential module completion (prerequisites enforced)
- Progress tracking with visual indicators
- Responsive design for mobile and desktop

## Setup and Installation

### Prerequisites

- Node.js 18+
- MongoDB database (local or MongoDB Atlas)
- pnpm (recommended) or npm

### 1. Clone and Install

```bash
git clone <repository-url>
cd lpms-assignment
pnpm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>
BETTER_AUTH_SECRET=<your-secret-key>
BETTER_AUTH_URL=http://localhost:3000
```

Generate a secret key:

```bash
openssl rand -base64 32
```

### 3. Seed the Database

Run the seed script to populate sample learning paths:

```bash
pnpm seed
```

This creates 3 learning paths with YouTube video modules:

- HTML Tutorials for Beginners (11 modules)
- React Hooks (10 modules)
- JavaScript Tutorials for Beginners (29 modules)

### 4. Run Development Server

```bash
pnpm dev
```

Open http://localhost:3000

### 5. Create an Account

Sign up at `/signup`. All learning paths are automatically assigned to new users.

## Architecture and Data Modeling

### Data Model

The application uses a normalized schema with 5 collections:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Path       │     │   PathModule    │     │     Module      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ _id             │◄────│ path_id         │────►│ _id             │
│ title           │     │ module_id       │     │ title           │
│ description     │     │ order           │     │ description     │
│ image           │     └─────────────────┘     │ content_type    │
└─────────────────┘                             │ content         │
                                                └─────────────────┘

┌─────────────────────┐     ┌─────────────────────────┐
│ UserPathAssignment  │     │  UserModuleCompletion   │
├─────────────────────┤     ├─────────────────────────┤
│ user_id             │     │ user_id                 │
│ path_id             │     │ path_id                 │
│ last_active         │     │ module_id               │
│ completed_at        │     │ completed_at            │
└─────────────────────┘     └─────────────────────────┘
```

**Design Decisions:**

1. **PathModule junction table:** Allows modules to be reused across paths and maintains ordering. The `order` field enables sequential progression.

2. **Separate completion tracking:** `UserModuleCompletion` records are created on completion rather than updating a field. This provides an audit trail and simplifies queries.

3. **User-Path assignment:** Decouples path availability from path definition. Admins can assign specific paths to users without modifying the path itself.

4. **Indexes:** Compound indexes on frequently queried fields (`user_id + path_id`, `path_id + order`) for query performance.

### API Design

| Endpoint         | Method | Description                                         |
| ---------------- | ------ | --------------------------------------------------- |
| `/api/paths`     | GET    | List user's assigned paths with progress            |
| `/api/paths/:id` | GET    | Get path details with modules and completion status |
| `/api/progress`  | POST   | Mark a module as complete (validates prerequisites) |

### Authentication

Better Auth handles email/password authentication with:

- Session stored in MongoDB (`sessions` collection)
- Cookie-based session management
- **Cookie caching** enabled to avoid database lookup on every request

## Dev Log

### Phase 1: Project Setup and Authentication

**Initial setup** with `create-next-app` using Next.js 16, TypeScript, Tailwind CSS 4, and App Router.

**Authentication decision:** Chose Better Auth over NextAuth because:

- Native MongoDB adapter
- Simpler API for email/password
- Built-in session management

Created Mongoose models with TypeScript interfaces. Used a `models/` directory with individual files for maintainability.

**Question I would have asked the team:** "Should users be auto-assigned all paths on signup, or should there be an admin interface for assignment?" Implemented auto-assignment as a database hook for simplicity.

### Phase 2: API Development

Built three API endpoints using Next.js Route Handlers with MongoDB aggregation pipelines. Used `$lookup` for joining collections and `$project` for shaping responses in single-query operations.

### Phase 3: Frontend Implementation

Built the dashboard with path cards showing:

- Title, description, thumbnail
- Progress bar with percentage
- Dynamic CTA ("Start Learning", "Continue", "Review")

**Path detail page** includes:

- YouTube embed player
- Module list with completion indicators
- Lock icons for prerequisite modules
- Mark Complete button

### Phase 4: Responsiveness

Made all pages responsive:

- Header: Hides email on mobile, icon-only logout button
- Path cards: Single column on mobile, multi-column on desktop
- Path detail: Stacked layout on mobile

### Phase 5: Sequential Module Completion

Added prerequisite validation in the `/api/progress` endpoint:

1. Check if module belongs to the path
2. Check if previous module (by order) is completed
3. Reject with 403 if prerequisite not met

Frontend shows locked modules with a lock icon and disabled state.

### Summary

Built a complete learning path management system with:

- Secure authentication
- Efficient data fetching
- Responsive UI
- Sequential progression
