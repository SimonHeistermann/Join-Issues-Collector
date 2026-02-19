/**
 * Migration script: Add phone numbers to contacts that don't have them.
 *
 * Usage: node scripts/migrate-phones.js
 */

const FIREBASE_URL = 'https://backendjoin-67278-default-rtdb.europe-west1.firebasedatabase.app';

const PHONE_NUMBERS = [
  '+49 151 1234567',
  '+49 152 2345678',
  '+49 160 3456789',
  '+49 170 4567890',
  '+49 171 5678901',
  '+49 172 6789012',
  '+49 173 7890123',
  '+49 174 8901234',
  '+49 175 9012345',
  '+49 176 0123456',
  '+49 177 1234560',
  '+49 178 2345670',
  '+49 179 3456780',
  '+49 180 4567891',
  '+49 181 5678902',
];

async function migrate() {
  console.log('Fetching contacts from Firebase...');
  const res = await fetch(`${FIREBASE_URL}/contacts.json`);
  const data = await res.json();

  if (!data) {
    console.log('No contacts found.');
    return;
  }

  let updated = 0;
  let phoneIdx = 0;
  const migrated = {};

  for (const [key, contact] of Object.entries(data)) {
    if (!contact) {
      migrated[key] = contact;
      continue;
    }
    if (!contact.phone || contact.phone.trim() === '') {
      updated++;
      migrated[key] = { ...contact, phone: PHONE_NUMBERS[phoneIdx % PHONE_NUMBERS.length] };
      phoneIdx++;
      console.log(`  Adding phone to "${contact.name}": ${migrated[key].phone}`);
    } else {
      migrated[key] = contact;
      console.log(`  "${contact.name}" already has phone: ${contact.phone}`);
    }
  }

  if (updated === 0) {
    console.log('All contacts already have phone numbers. Nothing to migrate.');
    return;
  }

  console.log(`\nUpdating ${updated} contact(s) with phone numbers...`);
  const putRes = await fetch(`${FIREBASE_URL}/contacts.json`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(migrated)
  });

  if (putRes.ok) {
    console.log(`Successfully added phone numbers to ${updated} contact(s).`);
  } else {
    console.error('Failed to save:', putRes.statusText);
  }
}

migrate().catch(console.error);
