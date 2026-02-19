import { Component, inject, signal, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services';

const ANIMATION_SHOWN_KEY = 'welcomeAnimationShown';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss'
})
export class WelcomeComponent implements AfterViewInit {
  private router = inject(Router);
  private authService = inject(AuthService);

  // Animation signals - control CSS classes in template
  overlayFading = signal(false);
  logoMoving = signal(false);
  // Initialize from localStorage so first render already hides overlay (prevents flash)
  animationDone = signal(!!localStorage.getItem(ANIMATION_SHOWN_KEY));

  ngAfterViewInit(): void {
    if (this.authService.isLoggedIn()) {
      this.animationDone.set(true);
      this.removeSplash();
      this.router.navigate(['/summary']);
      return;
    }

    const alreadyShown = localStorage.getItem(ANIMATION_SHOWN_KEY);
    if (alreadyShown) {
      // No animation - hide overlay immediately, remove splash, reset body bg
      this.animationDone.set(true);
      this.removeSplash();
      document.body.style.backgroundColor = '';
    } else {
      // First visit: mark splash as handled, then start animation
      localStorage.setItem(ANIMATION_SHOWN_KEY, 'true');
      const splash = document.getElementById('splash-screen');
      if (splash) splash.setAttribute('data-handled', 'true');
      this.startAnimation();
    }
  }

  private startAnimation(): void {
    // The Angular overlay is now rendered and looks identical to the splash.
    // Remove splash, then animate the Angular overlay.
    // Timing matches original frontend: logo moves at 100ms, overlay fades at 500ms.
    requestAnimationFrame(() => {
      // Remove splash - Angular overlay seamlessly takes over
      this.removeSplash();

      // Wait one frame for Angular to be painted, then start
      requestAnimationFrame(() => {
        // Logo starts moving to corner first (100ms delay, 1s transition in CSS)
        setTimeout(() => this.logoMoving.set(true), 100);

        // Overlay background fades out after a delay (500ms delay, 0.5s transition in CSS)
        setTimeout(() => this.overlayFading.set(true), 500);

        // Hide everything after all animations complete (~1600ms total)
        setTimeout(() => {
          this.animationDone.set(true);
          document.body.style.backgroundColor = '';
        }, 1600);
      });
    });
  }

  private removeSplash(): void {
    const splash = document.getElementById('splash-screen');
    if (splash) splash.remove();
  }

  goToStakeholder(): void {
    this.router.navigate(['/stakeholder']);
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
