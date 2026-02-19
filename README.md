<p align="center">
  <img src="public/assets/icons/join_logo_favicon_dark.svg" alt="Join Logo" width="120">
</p>

<h1 align="center">Join Issue Collector</h1>

<p align="center">
  <strong>AI-powered Kanban project management with automated email-to-ticket pipeline</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Angular-19-dd0031?logo=angular&logoColor=white" alt="Angular 19">
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5.7">
  <img src="https://img.shields.io/badge/Firebase-Realtime_DB-ffca28?logo=firebase&logoColor=black" alt="Firebase">
  <img src="https://img.shields.io/badge/n8n-Automation-ea4b71?logo=n8n&logoColor=white" alt="n8n">
  <img src="https://img.shields.io/badge/Gemini_AI-Email_Parsing-4285F4?logo=googlegemini&logoColor=white" alt="Gemini AI">
  <img src="https://img.shields.io/badge/License-Proprietary-lightgrey" alt="License">
</p>

---

## About

**Join Issue Collector** is a modern Kanban project management application built with Angular 19. It extends the classic Join board with an **AI-powered email-to-ticket pipeline**: external stakeholders submit feature requests and bug reports via email, which are automatically parsed by Google Gemini AI and converted into triage tickets — complete with status notifications back to the requester.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Production Build & Deployment](#production-build--deployment)
- [n8n Workflow Setup](#n8n-workflow-setup)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Author](#author)

---

## Features

### Kanban Board

- **5-column workflow**: Triage &rarr; To Do &rarr; In Progress &rarr; Await Feedback &rarr; Done
- **Drag & Drop** task management via Angular CDK
- **Real-time search** with instant filtering across all columns
- **Subtask tracking** with visual progress indicators
- **Priority system**: Urgent, Medium, Low — each with distinct iconography
- **Categories**: User Stories and Technical Tasks with colored labels

### AI-Powered Stakeholder Portal

- **Email-to-Ticket**: External users submit requests via email — Gemini AI parses and creates structured tickets
- **Creator Badges**: `INT` (internal, green) and `EXT` (external, yellow) badges on every ticket
- **Automated Status Notifications**: Stakeholders receive email updates when their ticket progresses through the board
- **Rate Limiting**: Max 10 automated ticket creations per day to prevent abuse

### Task Management

- Rich task editor with title, description, due date, priority, and category
- Multi-contact assignment with avatar badges
- Inline subtask creation, editing, and completion tracking
- Overlay-based task detail view and quick edit

### Contact Management

- Add, edit, and delete team contacts
- Alphabetical grouping with letter separators
- 15 distinct badge colors assigned by name hash
- Assign multiple contacts to tasks

### Authentication

- User login and registration with Firebase Realtime Database
- Guest access for quick demo exploration
- Auth guard on protected routes
- Persistent sessions via localStorage

### Dashboard

- Task statistics overview (total, urgent, upcoming deadlines)
- Welcome greeting with user name
- Quick navigation to board and task creation

### Responsive Design

- Full desktop layout with persistent sidebar navigation
- Mobile-optimized views with collapsible navigation
- Touch-friendly drag & drop on mobile devices

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Angular 19 | Standalone components, signals, lazy loading |
| **Language** | TypeScript 5.7 | Strict mode, template type checking |
| **Styling** | SCSS | Variables, mixins, custom properties |
| **Drag & Drop** | Angular CDK | Kanban card movement between columns |
| **Backend** | Firebase Realtime DB | REST API for tasks, contacts, users |
| **Automation** | n8n (Render.com) | Email-to-ticket & notification workflows |
| **AI** | Google Gemini API | Email content parsing and structuring |
| **Web Server** | Apache (.htaccess) | SPA routing, CORS, compression, caching |

---

## Architecture

```
                       +-----------------+
                       |   Gmail Inbox   |
                       +--------+--------+
                                |
                    (1-min poll via n8n)
                                |
                       +--------v--------+
                       |   n8n Workflow   |
                       |  (Render.com)   |
                       +--------+--------+
                                |
              +-----------------+-----------------+
              |                                   |
     +--------v--------+                +--------v--------+
     |   Gemini AI     |                | Rate Limiter    |
     |  (Email Parse)  |                | (10/day max)    |
     +--------+--------+                +--------+--------+
              |                                   |
              +----------------+------------------+
                               |
                      +--------v--------+
                      |    Firebase     |
                      |  Realtime DB   |
                      +--------+--------+
                               |
                      +--------v--------+
                      |  Angular 19 App |
                      |  (SPA Client)  |
                      +--------+--------+
                               |
                    (webhook on status change)
                               |
                      +--------v--------+
                      | n8n Notification|
                      |   Workflow      |
                      +--------+--------+
                               |
                      +--------v--------+
                      | Status Email to |
                      |   Stakeholder   |
                      +-----------------+
```

---

## Project Structure

```
issue-collector/
├── public/
│   ├── .htaccess                     # Apache config (SPA routing, CORS, caching)
│   ├── favicon.ico
│   └── assets/
│       ├── fonts/                    # Inter font family (woff2, 16 variants)
│       ├── icons/                    # 90+ application icons (PNG/SVG)
│       └── img/                      # Illustrations
├── src/
│   ├── index.html
│   ├── main.ts                       # Application bootstrap
│   ├── styles.scss                   # Global styles entry
│   ├── environments/
│   │   ├── environment.ts            # Development config
│   │   └── environment.prod.ts       # Production config
│   └── app/
│       ├── app.component.ts          # Root component (auth-conditional layout)
│       ├── app.routes.ts             # Route definitions with lazy loading
│       ├── core/
│       │   ├── guards/
│       │   │   └── auth.guard.ts     # Route protection
│       │   ├── models/
│       │   │   ├── user.model.ts     # User & CurrentUser interfaces
│       │   │   ├── task.model.ts     # Task, SubTask, Creator, enums
│       │   │   └── contact.model.ts  # Contact interface, badge colors
│       │   └── services/
│       │       ├── firebase.service.ts      # REST API wrapper
│       │       ├── auth.service.ts          # Authentication & sessions
│       │       ├── task.service.ts          # Task CRUD & board logic
│       │       ├── contact.service.ts       # Contact CRUD & grouping
│       │       ├── notification.service.ts  # n8n webhook integration
│       │       └── rate-limit.service.ts    # Daily rate limit tracking
│       ├── shared/
│       │   ├── components/
│       │   │   ├── header/           # Top navigation bar
│       │   │   ├── sidebar/          # Left navigation menu
│       │   │   ├── avatar-badge/     # User avatar display
│       │   │   └── priority-icon/    # Priority level indicator
│       │   └── pipes/
│       │       ├── initials.pipe.ts  # "John Doe" → "JD"
│       │       └── truncate.pipe.ts  # Text truncation
│       ├── features/
│       │   ├── auth/
│       │   │   ├── welcome/          # Landing page
│       │   │   ├── login/            # Login form
│       │   │   └── register/         # Registration form
│       │   ├── summary/              # Dashboard with statistics
│       │   ├── board/                # Kanban board with drag & drop
│       │   ├── add-task/             # Task creation & editing form
│       │   ├── contacts/             # Contact management
│       │   ├── stakeholder/
│       │   │   ├── stakeholder-info/ # External stakeholder info page
│       │   │   └── limit-reached/    # Rate limit exceeded page
│       │   └── legal/
│       │       ├── privacy-policy/
│       │       ├── legal-notice/
│       │       └── help/
│       └── styles/
│           ├── _variables.scss       # Design tokens & color palette
│           ├── _mixins.scss          # Layout & responsive mixins
│           ├── _fonts.scss           # @font-face declarations
│           └── _animations.scss      # Keyframe animations
├── n8n-workflows/
│   ├── email-to-ticket.json          # Gmail → AI → Firebase pipeline
│   └── status-notification.json      # Status change → Email pipeline
├── angular.json                      # Angular CLI configuration
├── tsconfig.json                     # TypeScript base config (strict)
├── tsconfig.app.json                 # App-specific TS config
├── tsconfig.spec.json                # Test TS config
└── package.json
```

---

## Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Angular CLI | 19+ |

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd issue-collector

# Install dependencies
npm install

# Start development server
ng serve
```

The application will be available at **http://localhost:4200**.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server |
| `npm run build` | Production build |
| `npm run watch` | Development build with file watching |
| `npm test` | Run unit tests via Karma |
| `ng serve --port 4300` | Dev server on custom port |
| `ng generate component features/<name>` | Generate new component |

---

## Configuration

### Environment Files

The application uses Angular environment files for configuration:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  firebaseUrl: 'https://backendjoin-67278-default-rtdb.europe-west1.firebasedatabase.app',
  n8nWebhookUrl: 'https://n8n-join.onrender.com/webhook/task-status-change',
  n8nBaseUrl: 'https://n8n-join.onrender.com'
};
```

For local overrides, create `src/environments/environment.local.ts` (gitignored).

### Firebase REST API Paths

| Endpoint | Purpose |
|----------|---------|
| `/tasks.json` | All tasks (GET, POST) |
| `/tasks/{id}.json` | Single task (GET, PUT, PATCH, DELETE) |
| `/contacts.json` | All contacts (GET, POST) |
| `/users.json` | User accounts |
| `/rate_limits/{YYYY-MM-DD}.json` | Daily rate limit counter |

---

## Production Build & Deployment

### Build

```bash
ng build
```

Output: `dist/join-angular/browser/`

All static assets are hashed for cache busting. The `.htaccess` from `public/` is included automatically.

### Apache / FTP Deployment

1. Run `ng build`
2. Upload the contents of `dist/join-angular/browser/` to your web server's document root
3. The bundled `.htaccess` handles:

| Feature | Details |
|---------|---------|
| **SPA Routing** | All routes redirect to `index.html` |
| **CORS** | Headers for n8n webhook communication |
| **Gzip** | Compression for CSS, JS, fonts, images |
| **Caching** | HTML: no-cache, CSS/JS/Fonts: 1 year, Images: 1 month |
| **Security** | X-Content-Type-Options, X-Frame-Options, XSS Protection |

---

## n8n Workflow Setup

The project uses two n8n workflows hosted on [Render.com](https://render.com):

### 1. Email-to-Ticket Pipeline

```
Gmail Inbox ──> Rate Limit Check ──> Gemini AI Parser ──> Firebase Task ──> Confirmation Email
  (1-min poll)     (max 10/day)      (content parsing)    (status: triage)   (to sender)
```

**What it does:**
- Polls a Gmail inbox every minute for new emails
- Checks the daily rate limit (max 10 tickets/day) via Firebase
- Parses email content with Google Gemini AI into structured task data
- Creates a new task in Firebase with status `triage` and creator type `external`
- Sends a confirmation email back to the sender

### 2. Status Notification Pipeline

```
Webhook (Angular app) ──> External Creator Check ──> Status Email to Stakeholder
```

**What it does:**
- Receives a POST request from the Angular app when a task's status changes
- Filters: only tasks with external creators trigger notifications
- Sends a status update email (or completion email) to the original requester

### Deploying n8n on Render.com

1. Create a **Web Service** on [Render.com](https://render.com) with Docker image `n8nio/n8n`
2. Set environment variables:
   ```
   N8N_HOST=0.0.0.0
   N8N_PORT=5678
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://<your-app>.onrender.com/
   N8N_ENCRYPTION_KEY=<random-32-char-string>
   GENERIC_TIMEZONE=Europe/Berlin
   ```
3. Add a **persistent disk**: mount path `/home/node/.n8n`, size 1 GB
4. Deploy and access the n8n dashboard
5. Configure credentials:
   - **Gmail OAuth2** (requires Google Cloud Console project with Gmail API enabled)
   - **Google Gemini API** key
   - **Firebase** REST API access
6. Import both workflow JSON files from `n8n-workflows/`
7. Assign credentials to all nodes and **activate** both workflows

---

## Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| Fonts not loading | Incorrect path | Ensure files exist in `public/assets/fonts/` and `_fonts.scss` references `/assets/fonts/` |
| Icons missing | Wrong directory | Icons must be in `public/assets/icons/`, referenced as `assets/icons/...` |
| Firebase connection fails | URL or rules | Verify URL in environment config and check database rules allow read/write |
| n8n workflow not triggering | Inactive workflow | Confirm workflow is activated and OAuth credentials haven't expired |
| Emails not sending | Missing scope | Check Gmail OAuth scopes include `gmail.send` and `gmail.readonly` |
| SPA routes return 404 | Missing .htaccess | Ensure `.htaccess` is present on server (auto-included in build output) |
| CORS errors calling n8n | Missing headers | Verify `.htaccess` was uploaded — it includes CORS headers for n8n |
| Rate limit not resetting | Timezone mismatch | Rate limits reset at UTC midnight — check `GENERIC_TIMEZONE` in n8n config |
| Drag & drop not working | CDK import | Ensure `@angular/cdk` is installed and `DragDropModule` is imported |

---

## License

This project was developed as part of a student project at [Developer Akademie GmbH](https://developerakademie.com/).

The design and brand assets are owned by Developer Akademie GmbH. Unauthorized use, reproduction, modification, or distribution of the design is prohibited.

---

## Author

**Simon Heistermann**

[business@heistermann-solutions.de](mailto:business@heistermann-solutions.de)
