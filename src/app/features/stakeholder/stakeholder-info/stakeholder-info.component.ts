import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RateLimitService } from '../../../core/services';
import { environment } from '../../../../environments/environment';

/**
 * Stakeholder Info Component
 * Landing page for stakeholders explaining how to submit feature requests via email
 */
@Component({
  selector: 'app-stakeholder-info',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './stakeholder-info.component.html',
  styleUrl: './stakeholder-info.component.scss'
})
export class StakeholderInfoComponent implements OnInit {
  private rateLimitService = inject(RateLimitService);
  private router = inject(Router);

  usedRequests = signal(0);

  async ngOnInit(): Promise<void> {
    await this.loadUsage();
  }

  async loadUsage(): Promise<void> {
    const usage = await this.rateLimitService.getTodayUsage();
    this.usedRequests.set(usage);

    // If limit reached, redirect
    if (usage >= 10) {
      this.router.navigate(['/limit-reached']);
    }
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
      `Type: (feature request / bug report)\n\nDescription:\n\n\nPriority: (low / medium / urgent)\n\nDeadline: (YYYY-MM-DD or leave empty)\n`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }
}
