import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { RateLimitService } from '../../../core/services';

/**
 * Stakeholder Info Component
 * Landing page for stakeholders explaining how to submit feature requests
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

  navigateToForm(): void {
    this.router.navigate(['/create-request']);
  }
}
