import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FirebaseService } from './firebase.service';

interface RateLimitData {
  count: number;
  last_updated: string;
}

/**
 * Rate Limit Service
 * Tracks daily requests per client fingerprint + global fallback (max 10/client, 50/day global)
 */
@Injectable({ providedIn: 'root' })
export class RateLimitService {
  private firebase = inject(FirebaseService);

  private readonly MAX_CLIENT_REQUESTS = 10;
  private readonly MAX_GLOBAL_REQUESTS = 50;
  private fingerprint: string | null = null;

  /**
   * Get today's date key in YYYY-MM-DD format
   */
  private getDateKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Generate a browser fingerprint hash using Web Crypto API
   */
  private async getFingerprint(): Promise<string> {
    if (this.fingerprint) return this.fingerprint;
    const raw = [
      navigator.userAgent,
      screen.width.toString(),
      screen.height.toString(),
      Intl.DateTimeFormat().resolvedOptions().timeZone
    ].join('|');
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
    this.fingerprint = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 16);
    return this.fingerprint;
  }

  /**
   * Get today's usage count for the current client
   */
  async getTodayUsage(): Promise<number> {
    const today = this.getDateKey();
    const fp = await this.getFingerprint();
    const data = await firstValueFrom(
      this.firebase.loadData<RateLimitData>(`rate_limits/${today}/${fp}`)
    );
    return data?.count || 0;
  }

  /**
   * Get today's global usage count
   */
  private async getGlobalUsage(): Promise<number> {
    const today = this.getDateKey();
    const data = await firstValueFrom(
      this.firebase.loadData<RateLimitData>(`rate_limits/${today}/_global`)
    );
    return data?.count || 0;
  }

  /**
   * Check if more requests are allowed today (per-client + global)
   */
  async checkLimit(): Promise<{
    allowed: boolean;
    used: number;
    remaining: number;
    max: number;
  }> {
    const [clientUsed, globalUsed] = await Promise.all([
      this.getTodayUsage(),
      this.getGlobalUsage()
    ]);
    const clientAllowed = clientUsed < this.MAX_CLIENT_REQUESTS;
    const globalAllowed = globalUsed < this.MAX_GLOBAL_REQUESTS;
    return {
      allowed: clientAllowed && globalAllowed,
      used: clientUsed,
      remaining: Math.max(0, this.MAX_CLIENT_REQUESTS - clientUsed),
      max: this.MAX_CLIENT_REQUESTS
    };
  }

  /**
   * Increment today's usage count (both per-client and global)
   */
  async incrementUsage(): Promise<void> {
    const today = this.getDateKey();
    const fp = await this.getFingerprint();
    const [clientCurrent, globalCurrent] = await Promise.all([
      this.getTodayUsage(),
      this.getGlobalUsage()
    ]);
    const timestamp = new Date().toISOString();

    await Promise.all([
      firstValueFrom(
        this.firebase.putData(`rate_limits/${today}/${fp}`, {
          count: clientCurrent + 1,
          last_updated: timestamp
        })
      ),
      firstValueFrom(
        this.firebase.putData(`rate_limits/${today}/_global`, {
          count: globalCurrent + 1,
          last_updated: timestamp
        })
      )
    ]);
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
