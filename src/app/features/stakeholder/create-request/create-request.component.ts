import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TaskService, RateLimitService, NotificationService, SanitizationService } from '../../../core/services';
import { firstValueFrom } from 'rxjs';
import { SubTask, TaskPriority, TaskCategory } from '../../../core/models/task.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-create-request',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-request.component.html',
  styleUrl: './create-request.component.scss'
})
export class CreateRequestComponent implements OnInit {
  private taskService = inject(TaskService);
  private rateLimitService = inject(RateLimitService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private sanitization = inject(SanitizationService);

  usedRequests = signal(0);

  // Form fields
  name = '';
  email = '';
  title = '';
  description = '';
  priority: TaskPriority = 2;
  category: TaskCategory | '' = '';
  dueDate = '';
  privacyAccepted = false;

  // Honeypot (bot protection)
  honeypot = '';

  // Subtasks
  subtasks: SubTask[] = [];
  newSubtaskText = '';
  subtaskInputActive = false;
  editingSubtaskId: number | null = null;
  editingSubtaskText = '';
  subtaskIdCounter = 0;

  // Category dropdown
  categoryDropdownOpen = false;

  // Validation
  touched: Record<string, boolean> = {};
  submitAttempted = false;
  submitting = false;

  // Notification
  showNotification = false;
  showError_ = false;
  errorMessage = '';

  // Error getters
  get nameError(): string {
    if (!this.showError('name')) return '';
    if (!this.name.trim()) return 'This field is required';
    if (this.name.trim().length < 2) return 'Name must be at least 2 characters';
    return '';
  }

  get emailError(): string {
    if (!this.showError('email')) return '';
    if (!this.email.trim()) return 'This field is required';
    if (!this.isValidEmail(this.email)) return 'Please enter a valid email address';
    return '';
  }

  get titleError(): string {
    if (!this.showError('title')) return '';
    if (!this.title.trim()) return 'This field is required';
    if (this.title.trim().length < 3) return 'Title must be at least 3 characters';
    return '';
  }

  get descriptionError(): string {
    if (!this.showError('description')) return '';
    if (!this.description.trim()) return 'This field is required';
    if (this.description.trim().length < 10) return 'Description must be at least 10 characters';
    return '';
  }

  get categoryError(): string {
    if (!this.showError('category')) return '';
    if (!this.category) return 'This field is required';
    return '';
  }

  get dateError(): string {
    if (!this.showError('dueDate')) return '';
    if (this.dueDate) {
      const selected = new Date(this.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) return 'Date cannot be in the past';
    }
    return '';
  }

  get privacyError(): string {
    if (!this.showError('privacy')) return '';
    if (!this.privacyAccepted) return 'You must accept the privacy policy';
    return '';
  }

  get isFormValid(): boolean {
    return this.name.trim().length >= 2 &&
      this.isValidEmail(this.email) &&
      this.title.trim().length >= 3 &&
      this.description.trim().length >= 10 &&
      !!this.category &&
      (!this.dueDate || new Date(this.dueDate) >= this.todayDate()) &&
      this.privacyAccepted;
  }

  async ngOnInit(): Promise<void> {
    const usage = await this.rateLimitService.getTodayUsage();
    this.usedRequests.set(usage);
    if (usage >= 10) {
      this.router.navigate(['/limit-reached']);
    }
    // Wake up n8n instance (Render free tier sleeps after inactivity)
    fetch(`${environment.n8nBaseUrl}/healthz`).catch(() => {});
  }

  // ====== VALIDATION HELPERS ======

  markTouched(field: string): void {
    this.touched[field] = true;
  }

  private showError(field: string): boolean {
    return this.touched[field] || this.submitAttempted;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private validateForm(): boolean {
    const valid =
      this.name.trim().length >= 2 &&
      this.isValidEmail(this.email) &&
      this.title.trim().length >= 3 &&
      this.description.trim().length >= 10 &&
      !!this.category &&
      (!this.dueDate || new Date(this.dueDate) >= this.todayDate()) &&
      this.privacyAccepted;
    return valid;
  }

  private todayDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  // ====== CATEGORY DROPDOWN ======

  toggleCategoryDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }

  closeCategoryDropdown(): void {
    this.categoryDropdownOpen = false;
    this.markTouched('category');
  }

  selectCategory(cat: TaskCategory): void {
    this.category = cat;
    this.categoryDropdownOpen = false;
    this.touched['category'] = true;
  }

  getCategoryLabel(): string {
    if (this.category === 'us') return 'User Story';
    if (this.category === 'tt') return 'Technical Task';
    return 'Select task category';
  }

  // ====== PRIORITY ======

  setPriority(prio: TaskPriority): void {
    this.priority = prio;
  }

  // ====== SUBTASKS ======

  activateSubtaskInput(): void {
    this.subtaskInputActive = true;
  }

  closeSubtaskInput(): void {
    this.subtaskInputActive = false;
    this.newSubtaskText = '';
  }

  addSubtask(): void {
    const text = this.newSubtaskText.trim();
    if (!text) return;
    this.subtasks.push({ id: this.subtaskIdCounter++, name: text, status: 0 });
    this.newSubtaskText = '';
    this.subtaskInputActive = false;
  }

  handleSubtaskKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addSubtask();
    }
  }

  startEditSubtask(subtask: SubTask): void {
    this.editingSubtaskId = subtask.id;
    this.editingSubtaskText = subtask.name;
  }

  saveEditSubtask(subtask: SubTask): void {
    const text = this.editingSubtaskText.trim();
    if (text) subtask.name = text;
    this.editingSubtaskId = null;
    this.editingSubtaskText = '';
  }

  handleEditSubtaskKeydown(event: KeyboardEvent, subtask: SubTask): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.saveEditSubtask(subtask);
    }
  }

  deleteSubtask(id: number): void {
    this.subtasks = this.subtasks.filter(s => s.id !== id);
  }

  // ====== FORM ACTIONS ======

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    this.submitAttempted = true;

    if (!this.validateForm() || this.submitting) return;

    // Honeypot check: if filled, a bot submitted the form → fake success
    if (this.honeypot) {
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
        this.router.navigate(['/stakeholder']);
      }, 3000);
      return;
    }

    this.submitting = true;

    try {
      const limit = await this.rateLimitService.checkLimit();
      if (!limit.allowed) {
        this.router.navigate(['/limit-reached']);
        return;
      }

      // Load existing tasks first to prevent overwriting them
      await firstValueFrom(this.taskService.loadTasks());

      const creator = {
        name: this.sanitization.sanitizeText(this.name.trim()),
        email: this.email.trim(),
        type: 'external' as const
      };

      const task = await this.taskService.createTask(
        {
          name: this.sanitization.sanitizeText(this.title.trim()),
          description: this.sanitization.sanitizeText(this.description.trim()),
          assigned_to: '',
          due_date: this.dueDate,
          prio: this.priority,
          category: this.category as TaskCategory,
          subtasks: this.subtasks.length > 0 ? [...this.subtasks] : ''
        },
        creator
      );

      await this.rateLimitService.incrementUsage();
      await this.notificationService.sendFormConfirmation(task);

      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
        this.router.navigate(['/stakeholder']);
      }, 3000);
    } catch {
      this.submitting = false;
      this.errorMessage = 'Something went wrong. Please try again.';
      this.showError_ = true;
      setTimeout(() => { this.showError_ = false; }, 5000);
    }
  }

  clearForm(): void {
    this.name = '';
    this.email = '';
    this.title = '';
    this.description = '';
    this.priority = 2;
    this.category = '';
    this.dueDate = '';
    this.privacyAccepted = false;
    this.subtasks = [];
    this.newSubtaskText = '';
    this.subtaskInputActive = false;
    this.editingSubtaskId = null;
    this.editingSubtaskText = '';
    this.categoryDropdownOpen = false;
    this.honeypot = '';
    this.touched = {};
    this.submitAttempted = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !(event.target instanceof HTMLTextAreaElement)) {
      event.preventDefault();
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  goBack(): void {
    this.router.navigate(['/stakeholder']);
  }
}
