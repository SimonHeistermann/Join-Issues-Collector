/**
 * Seed script: Pushes realistic sample tasks to Firebase Realtime Database.
 * Usage: node scripts/seed-tasks.js
 */

const FIREBASE_URL = 'https://backendjoin-67278-default-rtdb.europe-west1.firebasedatabase.app';

function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

const tasks = [
  {
    id: generateId(),
    name: 'Implement user authentication',
    description: 'Set up login and registration flow with email/password authentication. Include form validation, error handling, and session management.',
    assigned_to: { u1: 'Felix Krüger', u2: 'Julian Neumann' },
    due_date: '2026-03-01',
    prio: 3,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Create login form component', status: 1 },
      { id: 1, name: 'Create registration form component', status: 1 },
      { id: 2, name: 'Add form validation', status: 1 },
      { id: 3, name: 'Implement auth guard for protected routes', status: 0 }
    ],
    status: 'in-progress',
    creator: { name: 'Felix Krüger', email: 'felix.krueger@yahoo.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Design responsive navigation bar',
    description: 'Create a responsive sidebar navigation that collapses on mobile. Should include user avatar, menu items with icons, and a logout button.',
    assigned_to: { u1: 'Lara Schmidt' },
    due_date: '2026-02-28',
    prio: 2,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Desktop sidebar layout', status: 1 },
      { id: 1, name: 'Mobile hamburger menu', status: 1 },
      { id: 2, name: 'Add active state highlighting', status: 1 }
    ],
    status: 'done',
    creator: { name: 'Lara Schmidt', email: 'lara.schmidt@outlook.com', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment. Include linting, unit tests, and deployment to staging environment.',
    assigned_to: { u1: 'Alexander Bauer' },
    due_date: '2026-03-10',
    prio: 2,
    category: 'tt',
    subtasks: [
      { id: 0, name: 'Configure GitHub Actions workflow', status: 1 },
      { id: 1, name: 'Add linting step', status: 0 },
      { id: 2, name: 'Add unit test step', status: 0 },
      { id: 3, name: 'Configure deployment to staging', status: 0 }
    ],
    status: 'to-do',
    creator: { name: 'Alexander Bauer', email: 'alexander.bauer@posteo.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Fix drag & drop not working on mobile',
    description: 'The drag and drop functionality on the Kanban board does not work on touch devices. Investigate and fix the touch event handling.',
    assigned_to: { u1: 'Tom Hoffmann' },
    due_date: '2026-02-20',
    prio: 3,
    category: 'tt',
    subtasks: '',
    status: 'in-progress',
    creator: { name: 'Sandra Klein', email: 'sandra.klein@web.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Add contact management feature',
    description: 'As a user, I want to add, edit, and delete contacts so that I can assign them to tasks. Include a contact list view with search functionality.',
    assigned_to: { u1: 'Sarah Lehmann', u2: 'Daniel Fischer' },
    due_date: '2026-03-15',
    prio: 2,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Create contact list component', status: 1 },
      { id: 1, name: 'Add contact form (create/edit)', status: 1 },
      { id: 2, name: 'Implement delete with confirmation dialog', status: 0 },
      { id: 3, name: 'Add search/filter functionality', status: 0 }
    ],
    status: 'in-progress',
    creator: { name: 'Sarah Lehmann', email: 'sarah.lehmann@gmx.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Optimize image loading performance',
    description: 'Lazy load images and use WebP format where possible. Add loading skeletons for a better user experience.',
    assigned_to: { u1: 'Benjamin Schulz' },
    due_date: '2026-03-05',
    prio: 1,
    category: 'tt',
    subtasks: [
      { id: 0, name: 'Audit current image sizes', status: 0 },
      { id: 1, name: 'Convert to WebP format', status: 0 },
      { id: 2, name: 'Implement lazy loading', status: 0 }
    ],
    status: 'to-do',
    creator: { name: 'Benjamin Schulz', email: 'benjamin.schulz@t-online.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Create task summary dashboard',
    description: 'As a user, I want to see a summary of all tasks on a dashboard, including counts per status, upcoming deadlines, and urgent tasks.',
    assigned_to: { u1: 'Marc Schneider', u2: 'Lara Schmidt' },
    due_date: '2026-03-20',
    prio: 2,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Design dashboard layout', status: 1 },
      { id: 1, name: 'Implement task count cards', status: 1 },
      { id: 2, name: 'Add upcoming deadline section', status: 0 },
      { id: 3, name: 'Add urgent tasks highlight', status: 0 }
    ],
    status: 'await-feedback',
    creator: { name: 'Marc Schneider', email: 'marc.schneider@gmail.com', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Write unit tests for task service',
    description: 'Add comprehensive unit tests for the task service, covering CRUD operations, status updates, and edge cases.',
    assigned_to: { u1: 'Julian Neumann' },
    due_date: '2026-03-08',
    prio: 1,
    category: 'tt',
    subtasks: [
      { id: 0, name: 'Test createTask method', status: 0 },
      { id: 1, name: 'Test updateTask method', status: 0 },
      { id: 2, name: 'Test deleteTask method', status: 0 },
      { id: 3, name: 'Test updateTaskStatus method', status: 0 }
    ],
    status: 'to-do',
    creator: { name: 'Julian Neumann', email: 'julian.neumann@gmail.com', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Implement dark mode toggle',
    description: 'As a user, I want to switch between light and dark mode. The preference should persist across sessions.',
    assigned_to: { u1: 'Sandra Klein' },
    due_date: '2026-04-01',
    prio: 1,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Define dark mode color palette', status: 0 },
      { id: 1, name: 'Create theme toggle component', status: 0 },
      { id: 2, name: 'Persist preference in localStorage', status: 0 }
    ],
    status: 'to-do',
    creator: { name: 'Sandra Klein', email: 'sandra.klein@web.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Fix overlapping text in task cards',
    description: 'Long task titles overflow the card boundary on smaller screens. Add text truncation with ellipsis and a tooltip for the full title.',
    assigned_to: { u1: 'Tom Hoffmann' },
    due_date: '2026-02-18',
    prio: 2,
    category: 'tt',
    subtasks: '',
    status: 'done',
    creator: { name: 'Tom Hoffmann', email: 'tom.hoffmann@mail.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Add email notification system',
    description: 'Send email notifications to external stakeholders when their ticket status changes. Integrate with Resend API for reliable delivery.',
    assigned_to: { u1: 'Felix Krüger', u2: 'Alexander Bauer' },
    due_date: '2026-03-12',
    prio: 3,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Set up Resend API integration', status: 1 },
      { id: 1, name: 'Create email templates', status: 0 },
      { id: 2, name: 'Trigger notification on status change', status: 0 }
    ],
    status: 'in-progress',
    creator: { name: 'Felix Krüger', email: 'felix.krueger@yahoo.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Refactor SCSS to use design tokens',
    description: 'Replace hardcoded color values with SCSS variables and create a consistent design token system for spacing, typography, and colors.',
    assigned_to: { u1: 'Lara Schmidt' },
    due_date: '2026-03-25',
    prio: 1,
    category: 'tt',
    subtasks: [
      { id: 0, name: 'Define color tokens', status: 1 },
      { id: 1, name: 'Define spacing tokens', status: 1 },
      { id: 2, name: 'Define typography tokens', status: 0 },
      { id: 3, name: 'Migrate existing components', status: 0 }
    ],
    status: 'await-feedback',
    creator: { name: 'Lara Schmidt', email: 'lara.schmidt@outlook.com', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Implement task filtering and search',
    description: 'As a user, I want to filter tasks by assignee, priority, and category, and search tasks by title on the board view.',
    assigned_to: { u1: 'Daniel Fischer', u2: 'Marc Schneider' },
    due_date: '2026-03-18',
    prio: 2,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Add search input to board header', status: 1 },
      { id: 1, name: 'Implement title search logic', status: 1 },
      { id: 2, name: 'Add filter dropdowns', status: 0 },
      { id: 3, name: 'Persist filter state in URL params', status: 0 }
    ],
    status: 'in-progress',
    creator: { name: 'Daniel Fischer', email: 'daniel.fischer@yahoo.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Database backup automation',
    description: 'Set up automated daily backups of the Firebase Realtime Database. Store backups in a separate storage bucket with 30-day retention.',
    assigned_to: { u1: 'Alexander Bauer' },
    due_date: '2026-04-05',
    prio: 2,
    category: 'tt',
    subtasks: '',
    status: 'to-do',
    creator: { name: 'Alexander Bauer', email: 'alexander.bauer@posteo.de', type: 'internal' }
  },
  {
    id: generateId(),
    name: 'Add legal pages (Privacy & Imprint)',
    description: 'Create privacy policy and imprint pages accessible from the footer. Must comply with German legal requirements (DSGVO/Impressum).',
    assigned_to: { u1: 'Sarah Lehmann' },
    due_date: '2026-02-25',
    prio: 3,
    category: 'us',
    subtasks: [
      { id: 0, name: 'Create privacy policy page', status: 1 },
      { id: 1, name: 'Create imprint page', status: 1 },
      { id: 2, name: 'Add footer links', status: 1 }
    ],
    status: 'done',
    creator: { name: 'Sarah Lehmann', email: 'sarah.lehmann@gmx.de', type: 'internal' }
  }
];

// Add created_at timestamps (spread over the last 2 weeks)
const now = Date.now();
tasks.forEach((task, i) => {
  task.created_at = new Date(now - (tasks.length - i) * 24 * 60 * 60 * 1000).toISOString();
});

async function seedTasks() {
  console.log(`Pushing ${tasks.length} tasks to Firebase...`);

  const response = await fetch(`${FIREBASE_URL}/tasks.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(tasks)
  });

  if (!response.ok) {
    const text = await response.text();
    console.error(`Failed: ${response.status} ${text}`);
    process.exit(1);
  }

  const result = await response.json();
  console.log(`Successfully pushed ${tasks.length} tasks!`);
  console.log('Task statuses:');
  console.log(`  - to-do: ${tasks.filter(t => t.status === 'to-do').length}`);
  console.log(`  - in-progress: ${tasks.filter(t => t.status === 'in-progress').length}`);
  console.log(`  - await-feedback: ${tasks.filter(t => t.status === 'await-feedback').length}`);
  console.log(`  - done: ${tasks.filter(t => t.status === 'done').length}`);
}

seedTasks();
