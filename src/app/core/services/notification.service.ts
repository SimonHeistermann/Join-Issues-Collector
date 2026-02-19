import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskStatus } from '../models';

/**
 * Notification Service
 * Handles sending notifications via n8n webhooks
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
      creator: task.creator,
      timestamp: new Date().toISOString()
    };

    try {
      await firstValueFrom(
        this.http.post(environment.n8nWebhookUrl, payload)
      );
    } catch {
      // Notification delivery is non-critical; silently ignore failures
    }
  }

  /**
   * Send confirmation email for new ticket
   * Called by n8n workflow after email-to-ticket processing
   */
  async sendTicketConfirmation(_task: Task): Promise<void> {
    // Handled by n8n workflow — placeholder for potential direct email sending
  }
}
