import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services';

/**
 * Login Component
 * Handles user authentication with animated logo intro
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form fields
  email = '';
  password = '';

  // UI state
  showPassword = signal(false);
  isLoading = signal(false);

  // Error messages
  emailError = signal('');
  passwordError = signal('');

  ngOnInit(): void {
    // If already logged in, redirect to summary
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/summary']);
    }
  }

  togglePassword(): void {
    if (this.password.length > 0) {
      this.showPassword.update(v => !v);
    }
  }

  clearErrors(): void {
    this.emailError.set('');
    this.passwordError.set('');
  }

  async onSubmit(): Promise<void> {
    this.clearErrors();

    // Validate email
    if (!this.email) {
      this.emailError.set('Email is required');
      return;
    }
    if (!this.authService.isValidEmail(this.email)) {
      this.emailError.set('Please enter a valid email');
      return;
    }

    // Validate password
    if (!this.password) {
      this.passwordError.set('Password is required');
      return;
    }

    // Attempt login
    this.isLoading.set(true);
    const result = await this.authService.login({
      email: this.email,
      password: this.password
    });
    this.isLoading.set(false);

    if (result.success) {
      // Get last page or default to summary
      const lastPage = localStorage.getItem('lastPage') || '/summary';
      this.router.navigate([lastPage]);
    } else {
      this.passwordError.set(result.error || 'Login failed');
    }
  }

  async guestLogin(): Promise<void> {
    this.isLoading.set(true);
    const result = await this.authService.login({
      email: 'guest',
      password: 'guest123'
    });
    this.isLoading.set(false);

    if (result.success) {
      this.router.navigate(['/summary']);
    }
  }
}
