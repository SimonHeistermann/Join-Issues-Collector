import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RateLimitService } from '../../../core/services';
import { environment } from '../../../../environments/environment';

/**
 * Limit Reached Component
 * Shown when the daily request limit (10) has been exceeded
 */
@Component({
  selector: 'app-limit-reached',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './limit-reached.component.html',
  styleUrl: './limit-reached.component.scss'
})
export class LimitReachedComponent implements OnInit, OnDestroy {
  private rateLimitService = inject(RateLimitService);
  private router = inject(Router);
  private countdownInterval?: ReturnType<typeof setInterval>;

  timeUntilReset = signal('');

  ngOnInit(): void {
    this.updateCountdown();
    // Update countdown every minute
    this.countdownInterval = setInterval(() => this.updateCountdown(), 60000);
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  private updateCountdown(): void {
    const timeStr = this.rateLimitService.getTimeUntilResetString();
    this.timeUntilReset.set(timeStr);
  }

  goBack(): void {
    this.router.navigate(['/welcome']);
  }

  createEmailRequest(): void {
    // Wake up n8n instance (Render free tier sleeps after inactivity)
    fetch(`${environment.n8nBaseUrl}/healthz`).catch(() => {});

    // Open default email client with pre-filled template
    const email = 'requests@join-issue-collector.projects.simon-heistermann.de';
    const subject = encodeURIComponent('Request: ');
    const body = encodeURIComponent(
      `Type: (feature request / bug report)\n\nDescription:\n\n\nPriority: (low / medium / high / urgent)\n\nDeadline: (YYYY-MM-DD or leave empty)\n\nSubtasks:\n- \n- \n\nNote: Daily AI limit reached - this request will be manually reviewed.`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
}
