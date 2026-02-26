import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus } from '../models';

/**
 * Notification Service
 * Handles sending notifications via n8n webhooks with HMAC-SHA256 signing
 */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  /**
   * Send status change notification to external creator
   * Triggers n8n workflow to send email
   */
  async sendStatusChangeNotification(task: Task, previousStatus: TaskStatus): Promise<void> {
    if (!task.creator?.email || !environment.n8nWebhookUrl) return;

    const payload = {
      taskId: task.id,
      taskName: task.name,
      taskDescription: task.description,
      previousStatus,
      newStatus: task.status,
      prio: task.prio,
      due_date: task.due_date,
      category: task.category,
      subtasks: task.subtasks,
      assigned_to: task.assigned_to,
      creator: task.creator,
      ai_generated: task.ai_generated,
      timestamp: new Date().toISOString()
    };

    try {
      const headers = await this.buildSignedHeaders(payload);
      await firstValueFrom(
        this.http.post(environment.n8nWebhookUrl, payload, { headers })
      );
    } catch {
      // Notification delivery is non-critical; silently ignore failures
    }
  }

  /**
   * Send confirmation email for form-submitted request
   * Triggers n8n workflow to send confirmation to external creator
   */
  async sendFormConfirmation(task: Task): Promise<void> {
    if (!task.creator?.email || !environment.n8nFormWebhookUrl) return;

    const payload = {
      taskId: task.id,
      taskName: task.name,
      taskDescription: task.description,
      prio: task.prio,
      due_date: task.due_date,
      category: task.category,
      subtasks: task.subtasks,
      creator: task.creator,
      timestamp: new Date().toISOString()
    };

    try {
      const headers = await this.buildSignedHeaders(payload);
      await firstValueFrom(
        this.http.post(environment.n8nFormWebhookUrl, payload, { headers })
      );
    } catch {
      // Confirmation delivery is non-critical; silently ignore failures
    }
  }

  /**
   * Compute HMAC-SHA256 signature and return headers with signature attached
   */
  private async buildSignedHeaders(payload: object): Promise<HttpHeaders> {
    const body = JSON.stringify(payload);
    const signature = await this.computeHmac(body);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'X-Webhook-Signature': signature
    });
  }

  /**
   * Compute HMAC-SHA256 hex digest using Web Crypto API (browser-native)
   */
  private async computeHmac(data: string): Promise<string> {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(environment.n8nWebhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }
}
