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
      await firstValueFrom(
        this.http.post(environment.n8nWebhookUrl, payload)
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
      await firstValueFrom(
        this.http.post(environment.n8nFormWebhookUrl, payload)
      );
    } catch {
      // Confirmation delivery is non-critical; silently ignore failures
    }
  }
}
