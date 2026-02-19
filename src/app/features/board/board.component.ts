import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { AvatarBadgeComponent } from '../../shared/components/avatar-badge/avatar-badge.component';
import { PriorityIconComponent } from '../../shared/components/priority-icon/priority-icon.component';
import { TruncatePipe } from '../../shared/pipes/truncate.pipe';
import { AddTaskComponent } from '../add-task/add-task.component';
import { TaskService, ContactService, AuthService } from '../../core/services';
import { Task, TaskStatus, TaskPriority, TaskCategory, SubTask, BOARD_COLUMNS, getCategoryLabel, getPriorityLabel } from '../../core/models';
import { Contact, getBadgeColor, getContactInitials } from '../../core/models/contact.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    DragDropModule,
    SidebarComponent,
    HeaderComponent,
    AvatarBadgeComponent,
    PriorityIconComponent,
    TruncatePipe,
    AddTaskComponent
  ],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private contactService = inject(ContactService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  columns = BOARD_COLUMNS;
  columnIds = BOARD_COLUMNS.map(c => c.id);

  tasks = signal<Task[]>([]);
  searchTerm = '';

  // Column cache (prevents ExpressionChangedAfterItHasBeenCheckedError)
  private _cachedTasksRef: Task[] = [];
  private _cachedSearchTerm = '';
  private _columnCache = new Map<TaskStatus, Task[]>();

  // Add Task Overlay
  addTaskOverlayOpen = false;
  addTaskDefaultStatus: TaskStatus = 'to-do';

  // Task Detail Overlay
  detailOverlayOpen = false;
  selectedTask: Task | null = null;

  // Inline Edit Mode
  editMode = false;
  editTitle = '';
  editDescription = '';
  editDueDate = '';
  editPriority: TaskPriority = 2;
  editSubtasks: SubTask[] = [];
  editNewSubtaskText = '';
  editSubtaskInputActive = false;
  editSubtaskIdCounter = 0;

  // Edit: Contacts
  contacts: Contact[] = [];
  filteredContacts: Contact[] = [];
  editSelectedContacts: Contact[] = [];
  editContactSearchQuery = '';
  editContactDropdownOpen = false;

  ngOnInit(): void {
    this.loadTasks();
    this.subscriptions.push(
      this.contactService.loadContacts().subscribe(() => {
        this.contacts = this.contactService.getContactsSorted();
        this.filteredContacts = [...this.contacts];
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  loadTasks(): void {
    this.subscriptions.push(
      this.taskService.loadTasks().subscribe(tasks => {
        this.tasks.set(tasks);
      })
    );
  }

  getTasksForColumn(status: TaskStatus): Task[] {
    const currentTasks = this.tasks();
    if (currentTasks !== this._cachedTasksRef || this.searchTerm !== this._cachedSearchTerm) {
      this._cachedTasksRef = currentTasks;
      this._cachedSearchTerm = this.searchTerm;
      this._columnCache = new Map();
      for (const col of this.columns) {
        let filtered = currentTasks.filter(t => t.status === col.id);
        if (this.searchTerm && this.searchTerm.length >= 3) {
          const term = this.searchTerm.toLowerCase();
          filtered = filtered.filter(t =>
            t.name.toLowerCase().includes(term) ||
            t.description.toLowerCase().includes(term)
          );
        }
        this._columnCache.set(col.id, filtered);
      }
    }
    return this._columnCache.get(status) || [];
  }

  async onTaskDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): Promise<void> {
    if (event.previousContainer !== event.container) {
      const task = event.item.data as Task;
      // Optimistic: update UI immediately
      this.tasks.set(
        this.tasks().map(t => t.id === task.id ? { ...t, status: newStatus } : t)
      );
      try {
        await this.taskService.updateTaskStatus(task.id, newStatus);
      } catch {
        this.loadTasks();
      }
    }
  }

  getCategoryClass(category: string): string {
    return category === 'us' ? 'user-story' : 'technical-task';
  }

  getCategoryLabel(category: string): string {
    return getCategoryLabel(category as 'tt' | 'us');
  }

  getAssignees(task: Task): string[] {
    if (!task.assigned_to || typeof task.assigned_to === 'string') return [];
    return Object.values(task.assigned_to);
  }

  hasSubtasks(task: Task): boolean {
    return Array.isArray(task.subtasks) && task.subtasks.length > 0;
  }

  getSubtaskCount(task: Task): number {
    return Array.isArray(task.subtasks) ? task.subtasks.length : 0;
  }

  getCompletedSubtasks(task: Task): number {
    if (!Array.isArray(task.subtasks)) return 0;
    return task.subtasks.filter(st => st.status === 1).length;
  }

  getCompletionPercentage(task: Task): number {
    if (!this.hasSubtasks(task)) return 0;
    return (this.getCompletedSubtasks(task) / this.getSubtaskCount(task)) * 100;
  }

  // ====== TASK DETAIL OVERLAY ======

  openTaskDetails(task: Task): void {
    this.selectedTask = { ...task };
    this.editMode = false;
    this.detailOverlayOpen = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  closeTaskDetails(): void {
    this.detailOverlayOpen = false;
    this.selectedTask = null;
    this.editMode = false;
    if (!this.addTaskOverlayOpen) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  getDetailPriorityLabel(prio: number | ''): string {
    return getPriorityLabel(prio as TaskPriority);
  }

  getPriorityIcon(prio: number | ''): string {
    switch (prio) {
      case 1: return 'assets/icons/low_icon_green_small.png';
      case 2: return 'assets/icons/medium_icon_orange_small.png';
      case 3: return 'assets/icons/urgent_icon_red_small.png';
      default: return '';
    }
  }

  getInitials(name: string): string {
    return getContactInitials(name);
  }

  getBadgeColor(name: string): string {
    return getBadgeColor(name);
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  }

  getSubtasks(task: Task): SubTask[] {
    return Array.isArray(task.subtasks) ? task.subtasks : [];
  }

  isCreatorCurrentUser(): boolean {
    if (!this.selectedTask?.creator) return false;
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return false;
    return this.selectedTask.creator.email === currentUser.email
      || this.selectedTask.creator.name === currentUser.name;
  }

  navigateToCreatorProfile(): void {
    if (!this.selectedTask?.creator) return;
    const creatorName = this.selectedTask.creator.name;
    this.closeTaskDetails();
    this.router.navigate(['/contacts'], { queryParams: { highlight: creatorName } });
  }

  async toggleSubtask(subtask: SubTask): Promise<void> {
    if (!this.selectedTask) return;
    await this.taskService.toggleSubtaskStatus(this.selectedTask.id, subtask.id);
    this.loadTasks();
    const updated = this.taskService.getTaskById(this.selectedTask.id);
    if (updated) {
      this.selectedTask = { ...updated };
    }
  }

  async deleteTask(): Promise<void> {
    if (!this.selectedTask) return;
    await this.taskService.deleteTask(this.selectedTask.id);
    this.closeTaskDetails();
    this.loadTasks();
  }

  // ====== INLINE EDIT MODE ======

  enterEditMode(): void {
    if (!this.selectedTask) return;
    this.editTitle = this.selectedTask.name;
    this.editDescription = this.selectedTask.description;
    this.editDueDate = this.selectedTask.due_date;
    this.editPriority = this.selectedTask.prio || 2;
    this.editNewSubtaskText = '';
    this.editSubtaskInputActive = false;

    if (Array.isArray(this.selectedTask.subtasks)) {
      this.editSubtasks = this.selectedTask.subtasks.map(st => ({ ...st }));
      this.editSubtaskIdCounter = this.editSubtasks.length > 0
        ? Math.max(...this.editSubtasks.map(s => s.id)) + 1 : 0;
    } else {
      this.editSubtasks = [];
      this.editSubtaskIdCounter = 0;
    }

    if (this.selectedTask.assigned_to && typeof this.selectedTask.assigned_to !== 'string') {
      const assigneeNames = Object.values(this.selectedTask.assigned_to);
      this.editSelectedContacts = this.contacts.filter(c => assigneeNames.includes(c.name));
    } else {
      this.editSelectedContacts = [];
    }

    this.filteredContacts = [...this.contacts];
    this.editContactSearchQuery = '';
    this.editContactDropdownOpen = false;
    this.editMode = true;
  }

  async saveEdit(): Promise<void> {
    if (!this.selectedTask || !this.editTitle.trim()) return;

    const assignedTo: Record<string, string> | '' =
      this.editSelectedContacts.length > 0
        ? this.editSelectedContacts.reduce((acc, contact, index) => {
            acc[index.toString()] = contact.name;
            return acc;
          }, {} as Record<string, string>)
        : '';

    await this.taskService.updateTask({
      ...this.selectedTask,
      name: this.editTitle.trim(),
      description: this.editDescription.trim(),
      assigned_to: assignedTo,
      due_date: this.editDueDate,
      prio: this.editPriority,
      subtasks: this.editSubtasks.length > 0 ? [...this.editSubtasks] : ''
    });

    this.loadTasks();
    this.closeTaskDetails();
  }

  // Edit: contact dropdown
  toggleEditContactDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.editContactDropdownOpen = !this.editContactDropdownOpen;
    if (!this.editContactDropdownOpen) {
      this.editContactSearchQuery = '';
      this.filteredContacts = [...this.contacts];
    }
  }

  closeEditContactDropdown(): void {
    this.editContactDropdownOpen = false;
    this.editContactSearchQuery = '';
    this.filteredContacts = [...this.contacts];
  }

  filterEditContacts(): void {
    const query = this.editContactSearchQuery.toLowerCase();
    this.filteredContacts = this.contacts.filter(c => c.name.toLowerCase().includes(query));
  }

  isEditContactSelected(contact: Contact): boolean {
    return this.editSelectedContacts.some(c => c.id === contact.id);
  }

  toggleEditContactSelection(contact: Contact): void {
    if (this.isEditContactSelected(contact)) {
      this.editSelectedContacts = this.editSelectedContacts.filter(c => c.id !== contact.id);
    } else {
      this.editSelectedContacts.push(contact);
    }
  }

  // Edit: subtasks
  activateEditSubtaskInput(): void {
    this.editSubtaskInputActive = true;
  }

  closeEditSubtaskInput(): void {
    this.editSubtaskInputActive = false;
    this.editNewSubtaskText = '';
  }

  addEditSubtask(): void {
    const text = this.editNewSubtaskText.trim();
    if (!text) return;
    this.editSubtasks.push({ id: this.editSubtaskIdCounter++, name: text, status: 0 });
    this.editNewSubtaskText = '';
    this.editSubtaskInputActive = false;
  }

  handleEditSubtaskKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addEditSubtask();
    }
  }

  deleteEditSubtask(id: number): void {
    this.editSubtasks = this.editSubtasks.filter(s => s.id !== id);
  }

  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ====== ADD TASK OVERLAY ======

  openAddTaskOverlay(status: TaskStatus = 'to-do'): void {
    this.addTaskDefaultStatus = status;
    this.addTaskOverlayOpen = true;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
  }

  closeAddTaskOverlay(): void {
    this.addTaskOverlayOpen = false;
    if (!this.detailOverlayOpen) {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
  }

  onTaskCreated(): void {
    this.addTaskOverlayOpen = false;
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    this.loadTasks();
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
