import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { of } from 'rxjs';

import { BoardComponent } from './board.component';
import { TaskService } from '../../core/services';
import { Task, TaskStatus } from '../../core/models';

describe('BoardComponent', () => {
  let component: BoardComponent;
  let fixture: ComponentFixture<BoardComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;

  const mockTasks: Task[] = [
    {
      id: '1',
      name: 'Test Task 1',
      description: 'Test description 1',
      status: 'toDo' as TaskStatus,
      prio: 'medium',
      category: 'us',
      due_date: '2024-12-31',
      assigned_to: { user1: 'John Doe' },
      subtasks: []
    },
    {
      id: '2',
      name: 'Test Task 2',
      description: 'Test description 2',
      status: 'inProgress' as TaskStatus,
      prio: 'urgent',
      category: 'tt',
      due_date: '2024-12-31',
      assigned_to: { user1: 'Jane Doe' },
      subtasks: [
        { name: 'Subtask 1', status: 1 },
        { name: 'Subtask 2', status: 0 }
      ]
    }
  ];

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['loadTasks', 'updateTaskStatus']);
    taskServiceSpy.loadTasks.and.returnValue(of(mockTasks));
    taskServiceSpy.updateTaskStatus.and.returnValue(Promise.resolve());

    await TestBed.configureTestingModule({
      imports: [BoardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: TaskService, useValue: taskServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    expect(taskServiceSpy.loadTasks).toHaveBeenCalled();
    expect(component.tasks().length).toBe(2);
  });

  it('should filter tasks by column status', () => {
    const toDoTasks = component.getTasksForColumn('toDo');
    expect(toDoTasks.length).toBe(1);
    expect(toDoTasks[0].name).toBe('Test Task 1');

    const inProgressTasks = component.getTasksForColumn('inProgress');
    expect(inProgressTasks.length).toBe(1);
    expect(inProgressTasks[0].name).toBe('Test Task 2');
  });

  it('should filter tasks by search term', () => {
    component.searchTerm = 'Task 1';
    const filteredTasks = component.getTasksForColumn('toDo');
    expect(filteredTasks.length).toBe(1);
    expect(filteredTasks[0].name).toBe('Test Task 1');
  });

  it('should not filter with search term less than 3 characters', () => {
    component.searchTerm = 'Ta';
    const tasks = component.getTasksForColumn('toDo');
    expect(tasks.length).toBe(1);
  });

  it('should return correct category class', () => {
    expect(component.getCategoryClass('us')).toBe('user-story');
    expect(component.getCategoryClass('tt')).toBe('technical-task');
  });

  it('should check if task has subtasks', () => {
    expect(component.hasSubtasks(mockTasks[0])).toBeFalse();
    expect(component.hasSubtasks(mockTasks[1])).toBeTrue();
  });

  it('should calculate subtask completion percentage', () => {
    expect(component.getCompletionPercentage(mockTasks[0])).toBe(0);
    expect(component.getCompletionPercentage(mockTasks[1])).toBe(50);
  });

  it('should get completed subtasks count', () => {
    expect(component.getCompletedSubtasks(mockTasks[0])).toBe(0);
    expect(component.getCompletedSubtasks(mockTasks[1])).toBe(1);
  });

  it('should get total subtask count', () => {
    expect(component.getSubtaskCount(mockTasks[0])).toBe(0);
    expect(component.getSubtaskCount(mockTasks[1])).toBe(2);
  });

  it('should get assignees from task', () => {
    const assignees = component.getAssignees(mockTasks[0]);
    expect(assignees).toEqual(['John Doe']);
  });

  it('should return empty array for tasks without assignees', () => {
    const taskWithoutAssignees = { ...mockTasks[0], assigned_to: undefined };
    const assignees = component.getAssignees(taskWithoutAssignees as Task);
    expect(assignees).toEqual([]);
  });

  it('should have all board columns defined', () => {
    expect(component.columns.length).toBeGreaterThan(0);
    expect(component.columnIds.length).toBe(component.columns.length);
  });
});
