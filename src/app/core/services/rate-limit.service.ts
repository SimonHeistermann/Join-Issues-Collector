import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FirebaseService } from './firebase.service';

interface RateLimitData {
  count: number;
  last_updated: string;
}

/**
 * Rate Limit Service
 * Tracks daily email-to-ticket requests (max 10 per day)
 */
@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private firebase = inject(FirebaseService);

  private readonly MAX_DAILY_REQUESTS = 10;

  /**
   * Get today's date key in YYYY-MM-DD format
   */
  private getDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get today's usage count
   */
  async getTodayUsage(): Promise<number> {
    const today = this.getDateKey();
    const data = await firstValueFrom(
      this.firebase.loadData<RateLimitData>(`rate_limits/${today}`)
    );
    return data?.count || 0;
  }

  /**
   * Check if more requests are allowed today
   */
  async checkLimit(): Promise<{
    allowed: boolean;
    used: number;
    remaining: number;
    max: number;
  }> {
    const used = await this.getTodayUsage();
    return {
      allowed: used < this.MAX_DAILY_REQUESTS,
      used,
      remaining: Math.max(0, this.MAX_DAILY_REQUESTS - used),
      max: this.MAX_DAILY_REQUESTS
    };
  }

  /**
   * Increment today's usage count
   * Called after successful email-to-ticket conversion (by n8n)
   */
  async incrementUsage(): Promise<void> {
    const today = this.getDateKey();
    const current = await this.getTodayUsage();

    await firstValueFrom(
      this.firebase.putData(`rate_limits/${today}`, {
        count: current + 1,
        last_updated: new Date().toISOString()
      })
    );
  }

  /**
   * Get time until daily reset (midnight UTC)
   */
  getTimeUntilReset(): { hours: number; minutes: number } {
    const now = new Date();
    const midnight = new Date();
    midnight.setUTCHours(24, 0, 0, 0);

    const diff = midnight.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes };
  }

  /**
   * Format time until reset as string
   */
  getTimeUntilResetString(): string {
    const { hours, minutes } = this.getTimeUntilReset();
    return `${hours}h ${minutes}m`;
  }
}
