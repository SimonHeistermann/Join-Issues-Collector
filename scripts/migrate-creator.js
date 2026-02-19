/**
 * Migration script: Add creator data to existing tasks that don't have it.
 * Sets Guest User as the default creator for old tasks.
 *
 * Usage: node scripts/migrate-creator.js
 */

const FIREBASE_URL = 'https://backendjoin-67278-default-rtdb.europe-west1.firebasedatabase.app';

const DEFAULT_CREATOR = {
  name: 'Guest User',
  email: 'guest',
  type: 'internal'
};

async function migrate() {
  console.log('Fetching tasks from Firebase...');
  const res = await fetch(`${FIREBASE_URL}/tasks.json`);
  const data = await res.json();

  if (!data) {
    console.log('No tasks found.');
    return;
  }

  const tasks = Array.isArray(data) ? data : Object.values(data);
  let updated = 0;

  const migrated = tasks.map(task => {
    if (!task) return task;
    if (!task.creator) {
      updated++;
      return { ...task, creator: DEFAULT_CREATOR };
    }
    return task;
  });

  if (updated === 0) {
    console.log('All tasks already have creator data. Nothing to migrate.');
    return;
  }

  console.log(`Updating ${updated} task(s) with default creator...`);
  const putRes = await fetch(`${FIREBASE_URL}/tasks.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(migrated)
  });

  if (putRes.ok) {
    console.log(`Successfully migrated ${updated} task(s).`);
  } else {
    console.error('Failed to save:', putRes.statusText);
  }
}

migrate().catch(console.error);
