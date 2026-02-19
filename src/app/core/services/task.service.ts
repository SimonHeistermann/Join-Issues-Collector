import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom, map, tap } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { NotificationService } from './notification.service';
import {
  Task,
  SubTask,
  TaskStatus,
  Creator,
  generateTaskId,
  BOARD_COLUMNS
} from '../models';

/**
 * Task Service
 * Handles all task-related operations including CRUD and status changes
 */
@Injectable({ providedIn: 'root' })
export class TaskService {
  private firebase = inject(FirebaseService);
  private notificationService = inject(NotificationService);

  private tasksSubject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.tasksSubject.asObservable();

  /**
   * Load all tasks from Firebase
   */
  loadTasks(): Observable<Task[]> {
    return this.firebase.loadData<Record<string, Task>>('tasks').pipe(
      map(data => {
        if (!data) return [];
        return Object.values(data)
          .filter(task => task !== null && task !== undefined)
          .map(task => this.normalizeTask(task));
      }),
      tap(tasks => this.tasksSubject.next(tasks))
    );
  }

  /**
   * Normalize task data from Firebase
   * Firebase may return arrays as objects with numeric keys
   */
  private normalizeTask(task: Task): Task {
    let { subtasks, assigned_to } = task;
    let changed = false;

    if (subtasks && typeof subtasks === 'object' && !Array.isArray(subtasks)) {
      subtasks = Object.values(subtasks) as SubTask[];
      changed = true;
    }

    if (Array.isArray(assigned_to)) {
      const obj: Record<string, string> = {};
      (assigned_to as string[]).forEach((name, i) => { obj[String(i)] = name; });
      assigned_to = obj;
      changed = true;
    }

    return changed ? { ...task, subtasks, assigned_to } : task;
  }

  /**
   * Get current tasks value
   */
  getTasks(): Task[] {
    return this.tasksSubject.value;
  }

  /**
   * Get tasks filtered by status
   */
  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasksSubject.value.filter(task => task.status === status);
  }

  /**
   * Get tasks for each board column
   */
  getTasksGroupedByColumn(): Map<TaskStatus, Task[]> {
    const grouped = new Map<TaskStatus, Task[]>();
    BOARD_COLUMNS.forEach(col => {
      grouped.set(col.id, this.getTasksByStatus(col.id));
    });
    return grouped;
  }

  /**
   * Create a new task
   * Default status is 'triage'
   */
  async createTask(
    taskData: Omit<Task, 'id' | 'status' | 'created_at'> & { status?: TaskStatus },
    creator?: Creator
  ): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: generateTaskId(),
      status: taskData.status || 'triage',
      creator: creator,
      created_at: new Date().toISOString()
    };

    const tasks = [...this.tasksSubject.value, newTask];
    await firstValueFrom(this.firebase.putData('tasks', tasks));
    this.tasksSubject.next(tasks);

    return newTask;
  }

  /**
   * Update an existing task
   */
  async updateTask(task: Task): Promise<void> {
    const tasks = this.tasksSubject.value.map(t =>
      t.id === task.id ? { ...task, updated_at: new Date().toISOString() } : t
    );

    await firstValueFrom(this.firebase.putData('tasks', tasks));
    this.tasksSubject.next(tasks);
  }

  /**
   * Update task status (move between columns)
   * Sends notification to external creators
   */
  async updateTaskStatus(taskId: string, newStatus: TaskStatus): Promise<void> {
    const task = this.tasksSubject.value.find(t => t.id === taskId);
    if (!task) return;

    const previousStatus = task.status;
    const updatedTask = {
      ...task,
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    const tasks = this.tasksSubject.value.map(t =>
      t.id === taskId ? updatedTask : t
    );

    await firstValueFrom(this.firebase.putData('tasks', tasks));
    this.tasksSubject.next(tasks);

    // Send notification if external creator
    if (task.creator?.type === 'external') {
      await this.notificationService.sendStatusChangeNotification(
        updatedTask,
        previousStatus
      );
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    const tasks = this.tasksSubject.value.filter(t => t.id !== taskId);
    await firstValueFrom(this.firebase.putData('tasks', tasks));
    this.tasksSubject.next(tasks);
  }

  /**
   * Get a single task by ID
   */
  getTaskById(taskId: string): Task | undefined {
    return this.tasksSubject.value.find(t => t.id === taskId);
  }

  /**
   * Search tasks by name or description
   */
  searchTasks(query: string): Task[] {
    if (!query || query.length < 3) return this.tasksSubject.value;

    const lowerQuery = query.toLowerCase();
    return this.tasksSubject.value.filter(task =>
      task.name.toLowerCase().includes(lowerQuery) ||
      task.description.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Update subtask status
   */
  async toggleSubtaskStatus(taskId: string, subtaskId: number): Promise<void> {
    const task = this.getTaskById(taskId);
    if (!task || task.subtasks === '') return;

    const subtasks = task.subtasks.map(st =>
      st.id === subtaskId ? { ...st, status: st.status === 0 ? 1 : 0 } as const : st
    );

    await this.updateTask({ ...task, subtasks });
  }
}
