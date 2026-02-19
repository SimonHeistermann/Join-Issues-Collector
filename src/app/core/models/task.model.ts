/**
 * Creator information for a task
 * Tracks who created the task and whether they are internal (team) or external (stakeholder)
 */
export interface Creator {
  name: string;
  email: string;
  type: 'internal' | 'external';
}

/**
 * Subtask within a task
 * status: 0 = incomplete, 1 = complete
 */
export interface SubTask {
  id: number;
  name: string;
  status: 0 | 1;
}

/**
 * All possible task statuses for the Kanban board
 * 'triage' is the new default status for all newly created tasks
 */
export type TaskStatus =
  | 'triage'
  | 'to-do'
  | 'in-progress'
  | 'await-feedback'
  | 'done';

/**
 * Priority levels for tasks
 * 1 = Low (green), 2 = Medium (orange), 3 = Urgent (red)
 */
export type TaskPriority = 1 | 2 | 3 | '';

/**
 * Task category
 * 'tt' = Technical Task, 'us' = User Story
 */
export type TaskCategory = 'tt' | 'us';

/**
 * Main Task interface
 * Represents a ticket/task on the Kanban board
 */
export interface Task {
  id: string;
  name: string;
  description: string;
  assigned_to: Record<string, string> | '';
  due_date: string;
  prio: TaskPriority;
  category: TaskCategory;
  subtasks: SubTask[] | '';
  status: TaskStatus;
  creator?: Creator;
  ai_generated?: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Board column configuration
 */
export interface BoardColumn {
  id: TaskStatus;
  label: string;
}

/**
 * Default board columns including the new Triage column
 */
export const BOARD_COLUMNS: BoardColumn[] = [
  { id: 'triage', label: 'Triage' },
  { id: 'to-do', label: 'To do' },
  { id: 'in-progress', label: 'In progress' },
  { id: 'await-feedback', label: 'Await feedback' },
  { id: 'done', label: 'Done' }
];

/**
 * Helper to get priority label
 */
export function getPriorityLabel(prio: TaskPriority): string {
  switch (prio) {
    case 1: return 'Low';
    case 2: return 'Medium';
    case 3: return 'Urgent';
    default: return '';
  }
}

/**
 * Helper to get category label
 */
export function getCategoryLabel(category: TaskCategory): string {
  return category === 'us' ? 'User Story' : 'Technical Task';
}

/**
 * Helper to generate unique task ID
 */
export function generateTaskId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}
