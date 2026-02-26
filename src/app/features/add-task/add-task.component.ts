import { Component, OnInit, OnChanges, OnDestroy, SimpleChanges, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TaskService, ContactService, AuthService, SanitizationService } from '../../core/services';
import { Contact, getBadgeColor, getContactInitials } from '../../core/models/contact.model';
import { Task, SubTask, TaskPriority, TaskCategory, TaskStatus } from '../../core/models/task.model';

@Component({
  selector: 'app-add-task',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss'
})
export class AddTaskComponent implements OnInit, OnChanges, OnDestroy {
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private sanitization = inject(SanitizationService);
  private subscriptions: Subscription[] = [];

  @Input() overlayMode = false;
  @Input() defaultStatus: TaskStatus = 'to-do';
  @Input() editTask: Task | null = null;
  @Output() taskCreated = new EventEmitter<void>();
  @Output() overlayClose = new EventEmitter<void>();

  get isEditMode(): boolean {
    return this.editTask !== null;
  }

  // Form fields
  title = '';
  description = '';
  dueDate = '';
  priority: TaskPriority = 2;
  category: TaskCategory | '' = '';

  // Contacts
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  selectedContacts: Contact[] = [];
  contactSearchQuery = '';
  contactDropdownOpen = false;

  // Category
  categoryDropdownOpen = false;

  // Subtasks
  subtasks: SubTask[] = [];
  newSubtaskText = '';
  subtaskInputActive = false;
  editingSubtaskId: number | null = null;
  editingSubtaskText = '';
  subtaskIdCounter = 0;

  // Validation
  titleError = '';
  dateError = '';
  categoryError = '';

  // Notification
  showNotification = false;

  ngOnInit(): void {
    this.subscriptions.push(
      this.contactService.loadContacts().subscribe(() => {
        this.contacts = this.contactService.getContactsSorted();
        this.filteredContacts = [...this.contacts];
        if (this.editTask) {
          this.populateFormFromTask(this.editTask);
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['editTask'] && this.editTask && this.contacts.length > 0) {
      this.populateFormFromTask(this.editTask);
    }
  }

  private populateFormFromTask(task: Task): void {
    this.title = task.name;
    this.description = task.description;
    this.dueDate = task.due_date;
    this.priority = task.prio || 2;
    this.category = task.category;
    this.defaultStatus = task.status;

    if (task.assigned_to && typeof task.assigned_to !== 'string') {
      const assigneeNames = Object.values(task.assigned_to);
      this.selectedContacts = this.contacts.filter(c =>
        assigneeNames.includes(c.name)
      );
    } else {
      this.selectedContacts = [];
    }

    if (Array.isArray(task.subtasks)) {
      this.subtasks = task.subtasks.map(st => ({ ...st }));
      this.subtaskIdCounter = this.subtasks.length > 0
        ? Math.max(...this.subtasks.map(s => s.id)) + 1 : 0;
    } else {
      this.subtasks = [];
    }
  }

  // ====== CONTACT DROPDOWN ======

  toggleContactDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.contactDropdownOpen = !this.contactDropdownOpen;
    if (!this.contactDropdownOpen) {
      this.contactSearchQuery = '';
      this.filteredContacts = [...this.contacts];
    }
  }

  closeContactDropdown(): void {
    this.contactDropdownOpen = false;
    this.contactSearchQuery = '';
    this.filteredContacts = [...this.contacts];
  }

  filterContacts(): void {
    const query = this.contactSearchQuery.toLowerCase();
    this.filteredContacts = this.contacts.filter(c =>
      c.name.toLowerCase().includes(query)
    );
  }

  isContactSelected(contact: Contact): boolean {
    return this.selectedContacts.some(c => c.id === contact.id);
  }

  toggleContactSelection(contact: Contact): void {
    if (this.isContactSelected(contact)) {
      this.selectedContacts = this.selectedContacts.filter(c => c.id !== contact.id);
    } else {
      this.selectedContacts.push(contact);
    }
  }

  getInitials(name: string): string {
    return getContactInitials(name);
  }

  getBadgeColor(name: string): string {
    return getBadgeColor(name);
  }

  isCurrentUser(contact: Contact): boolean {
    const currentUser = this.authService.getCurrentUser();
    return currentUser ? contact.name === currentUser.name : false;
  }

  // ====== CATEGORY DROPDOWN ======

  toggleCategoryDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.categoryDropdownOpen = !this.categoryDropdownOpen;
  }

  closeCategoryDropdown(): void {
    this.categoryDropdownOpen = false;
  }

  selectCategory(cat: TaskCategory): void {
    this.category = cat;
    this.categoryError = '';
    this.categoryDropdownOpen = false;
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

    this.subtasks.push({
      id: this.subtaskIdCounter++,
      name: text,
      status: 0
    });
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
    if (text) {
      subtask.name = text;
    }
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

  // ====== VALIDATION ======

  validateForm(): boolean {
    let valid = true;
    this.titleError = '';
    this.dateError = '';
    this.categoryError = '';

    if (!this.title.trim()) {
      this.titleError = 'This field is required';
      valid = false;
    }

    if (!this.dueDate) {
      this.dateError = 'This field is required';
      valid = false;
    } else {
      const selected = new Date(this.dueDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        this.dateError = 'Date cannot be in the past';
        valid = false;
      }
    }

    if (!this.category) {
      this.categoryError = 'This field is required';
      valid = false;
    }

    return valid;
  }

  // ====== FORM ACTIONS ======

  async handleSubmit(event: Event): Promise<void> {
    event.preventDefault();
    if (!this.validateForm()) return;

    const assignedTo: Record<string, string> | '' =
      this.selectedContacts.length > 0
        ? this.selectedContacts.reduce((acc, contact, index) => {
            acc[index.toString()] = contact.name;
            return acc;
          }, {} as Record<string, string>)
        : '';

    const sanitizedSubtasks = this.subtasks.map(st => ({ ...st, name: this.sanitization.sanitizeText(st.name) }));

    if (this.isEditMode && this.editTask) {
      await this.taskService.updateTask({
        ...this.editTask,
        name: this.sanitization.sanitizeText(this.title.trim()),
        description: this.sanitization.sanitizeText(this.description.trim()),
        assigned_to: assignedTo,
        due_date: this.dueDate,
        prio: this.priority,
        category: this.category as TaskCategory,
        status: this.defaultStatus,
        subtasks: sanitizedSubtasks.length > 0 ? sanitizedSubtasks : ''
      });
    } else {
      const currentUser = this.authService.getCurrentUser();
      const creator = currentUser
        ? { name: currentUser.name, email: currentUser.email, type: 'internal' as const }
        : undefined;

      await this.taskService.createTask(
        {
          name: this.sanitization.sanitizeText(this.title.trim()),
          description: this.sanitization.sanitizeText(this.description.trim()),
          assigned_to: assignedTo,
          due_date: this.dueDate,
          prio: this.priority,
          category: this.category as TaskCategory,
          status: this.defaultStatus,
          subtasks: sanitizedSubtasks.length > 0 ? sanitizedSubtasks : '',
          creator
        },
        creator
      );
    }

    if (this.overlayMode) {
      this.taskCreated.emit();
      this.clearForm();
    } else {
      this.showNotification = true;
      setTimeout(() => {
        this.showNotification = false;
        this.router.navigate(['/board']);
      }, 2000);
    }
  }

  clearForm(): void {
    this.title = '';
    this.description = '';
    this.dueDate = '';
    this.priority = 2;
    this.category = '';
    this.selectedContacts = [];
    this.subtasks = [];
    this.newSubtaskText = '';
    this.subtaskInputActive = false;
    this.editingSubtaskId = null;
    this.titleError = '';
    this.dateError = '';
    this.categoryError = '';
    this.contactSearchQuery = '';
    this.filteredContacts = [...this.contacts];
    this.contactDropdownOpen = false;
    this.categoryDropdownOpen = false;
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}
