import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services';

/**
 * Register Component
 * Handles new user registration
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // Form fields
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  acceptPrivacy = false;

  // UI state
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isLoading = signal(false);
  showSuccess = signal(false);

  // Error messages
  nameError = signal('');
  emailError = signal('');
  passwordError = signal('');
  confirmPasswordError = signal('');
  privacyError = signal('');

  togglePassword(): void {
    if (this.password.length > 0) {
      this.showPassword.update(v => !v);
    }
  }

  toggleConfirmPassword(): void {
    if (this.confirmPassword.length > 0) {
      this.showConfirmPassword.update(v => !v);
    }
  }

  clearError(field: string): void {
    switch (field) {
      case 'name':
        this.nameError.set('');
        break;
      case 'email':
        this.emailError.set('');
        break;
      case 'password':
        this.passwordError.set('');
        break;
      case 'confirmPassword':
        this.confirmPasswordError.set('');
        break;
      case 'privacy':
        this.privacyError.set('');
        break;
    }
  }

  async onSubmit(): Promise<void> {
    // Clear all errors
    this.nameError.set('');
    this.emailError.set('');
    this.passwordError.set('');
    this.confirmPasswordError.set('');
    this.privacyError.set('');

    let hasError = false;

    // Validate name
    if (!this.name.trim()) {
      this.nameError.set('Name is required');
      hasError = true;
    }

    // Validate email
    if (!this.email) {
      this.emailError.set('Email is required');
      hasError = true;
    } else if (!this.authService.isValidEmail(this.email)) {
      this.emailError.set('Please enter a valid email');
      hasError = true;
    }

    // Validate password
    if (!this.password) {
      this.passwordError.set('Password is required');
      hasError = true;
    } else if (this.password.length < 6) {
      this.passwordError.set('Password must be at least 6 characters');
      hasError = true;
    }

    // Validate confirm password
    if (!this.confirmPassword) {
      this.confirmPasswordError.set('Please confirm your password');
      hasError = true;
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError.set('Passwords do not match');
      hasError = true;
    }

    // Validate privacy policy
    if (!this.acceptPrivacy) {
      this.privacyError.set('Please accept the privacy policy');
      hasError = true;
    }

    if (hasError) return;

    // Attempt registration
    this.isLoading.set(true);
    const result = await this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      acceptPrivacy: this.acceptPrivacy
    });
    this.isLoading.set(false);

    if (result.success) {
      this.showSuccess.set(true);
      setTimeout(() => {
        this.router.navigate(['/login'], { queryParams: { skipAnimation: true } });
      }, 1500);
    } else {
      this.emailError.set(result.error || 'Registration failed');
    }
  }
}
