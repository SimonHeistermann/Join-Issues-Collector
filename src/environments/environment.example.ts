/**
 * Environment template - copy to environment.ts and environment.prod.ts
 * Fill in your actual values.
 */
export const environment = {
  production: false,
  firebaseUrl: 'https://YOUR_FIREBASE_PROJECT.firebasedatabase.app',
  n8nWebhookUrl: 'https://YOUR_N8N_INSTANCE/webhook/task-status-change',
  n8nFormWebhookUrl: 'https://YOUR_N8N_INSTANCE/webhook/form-submission',
  n8nBaseUrl: 'https://YOUR_N8N_INSTANCE',
  n8nWebhookSecret: 'YOUR_WEBHOOK_SECRET'
};
