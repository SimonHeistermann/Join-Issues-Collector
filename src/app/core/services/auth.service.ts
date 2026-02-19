import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, firstValueFrom, map } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { User, CurrentUser, LoginCredentials, RegisterData, getInitials, GUEST_USER } from '../models';

const STORAGE_KEY = 'currentUser';

/**
 * Authentication Service
 * Handles login, logout, registration, and session management
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private firebase = inject(FirebaseService);
  private router = inject(Router);

  private usersSubject = new BehaviorSubject<User[]>([]);
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isLoggedIn$ = this.currentUser$.pipe(map(user => !!user));

  // Signal for reactive current user
  public currentUser = signal<CurrentUser | null>(null);

  constructor() {
    this.loadCurrentUserFromStorage();
  }

  /**
   * Load current user from localStorage
   */
  private loadCurrentUserFromStorage(): void {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const user = JSON.parse(stored) as CurrentUser;
        this.currentUserSubject.next(user);
        this.currentUser.set(user);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  /**
   * Load all users from Firebase
   */
  async loadUsers(): Promise<User[]> {
    const data = await firstValueFrom(
      this.firebase.loadData<Record<string, User>>('users')
    );
    const users = data ? Object.values(data).filter(u => u !== null) : [];
    this.usersSubject.next(users);
    return users;
  }

  /**
   * Login with email and password
   */
  async login(credentials: LoginCredentials): Promise<{ success: boolean; error?: string }> {
    await this.loadUsers();
    const users = this.usersSubject.value;

    // Check for guest login
    if (credentials.email === 'guest' && credentials.password === 'guest123') {
      this.setCurrentUser(GUEST_USER);
      return { success: true };
    }

    // Find user by email
    const user = users.find(u => u.email === credentials.email);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Check password (plain text comparison - as in original)
    if (user.pw !== credentials.password) {
      return { success: false, error: 'Invalid password' };
    }

    // Login successful
    const currentUser: CurrentUser = {
      email: user.email,
      name: user.name,
      initials: user.initials,
      tel: user.tel
    };
    this.setCurrentUser(currentUser);
    return { success: true };
  }

  /**
   * Register a new user
   */
  async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
    // Validate passwords match
    if (data.password !== data.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    await this.loadUsers();
    const users = this.usersSubject.value;

    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      return { success: false, error: 'Email already registered' };
    }

    // Create new user
    const newUser: User = {
      email: data.email,
      name: data.name,
      initials: getInitials(data.name),
      pw: data.password // Plain text password (as in original)
    };

    // Save to Firebase
    const updatedUsers = [...users, newUser];
    await firstValueFrom(this.firebase.putData('users', updatedUsers));
    this.usersSubject.next(updatedUsers);

    return { success: true };
  }

  /**
   * Set current user and save to localStorage
   */
  private setCurrentUser(user: CurrentUser): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.currentUser.set(user);
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('lastPage');
    this.currentUserSubject.next(null);
    this.currentUser.set(null);
    this.router.navigate(['/welcome']);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  /**
   * Get current user
   */
  getCurrentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
