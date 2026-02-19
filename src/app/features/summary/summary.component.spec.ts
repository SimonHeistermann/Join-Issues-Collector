import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

import { SummaryComponent } from './summary.component';
import { TaskService, AuthService } from '../../core/services';

describe('SummaryComponent', () => {
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockTaskService = jasmine.createSpyObj('TaskService', ['loadTasks']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockTaskService.loadTasks.and.returnValue(of([]));
    mockAuthService.getCurrentUser.and.returnValue({ name: 'Test User' } as any);

    await TestBed.configureTestingModule({
      imports: [SummaryComponent],
      providers: [
        { provide: TaskService, useValue: mockTaskService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set user name on init', () => {
    expect(component.userName()).toBe('Test User');
  });

  it('should set time of day on init', () => {
    const timeOfDay = component.timeOfDay();
    expect(['morning', 'afternoon', 'evening']).toContain(timeOfDay);
  });

  it('should load task stats on init', () => {
    expect(mockTaskService.loadTasks).toHaveBeenCalled();
  });

  it('should navigate to board when goToBoard is called', () => {
    component.goToBoard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/board']);
  });

  it('should calculate task counts correctly', () => {
    const mockTasks = [
      { status: 'triage', prio: 1 },
      { status: 'to-do', prio: 2 },
      { status: 'in-progress', prio: 3, due_date: '2024-12-31' },
      { status: 'await-feedback', prio: 1 },
      { status: 'done', prio: 2 }
    ] as any[];

    mockTaskService.loadTasks.and.returnValue(of(mockTasks));

    component.ngOnInit();

    expect(component.taskCounts().triage).toBe(1);
    expect(component.taskCounts().todo).toBe(1);
    expect(component.taskCounts().inProgress).toBe(1);
    expect(component.taskCounts().awaitFeedback).toBe(1);
    expect(component.taskCounts().done).toBe(1);
    expect(component.taskCounts().urgent).toBe(1);
    expect(component.taskCounts().total).toBe(5);
  });

  it('should set next deadline for urgent tasks', () => {
    const mockTasks = [
      { status: 'to-do', prio: 3, due_date: '2024-12-31' },
      { status: 'to-do', prio: 3, due_date: '2024-12-15' }
    ] as any[];

    mockTaskService.loadTasks.and.returnValue(of(mockTasks));

    component.ngOnInit();

    expect(component.nextDeadline()).toBe('2024-12-15');
  });

  it('should default to Guest when no user is logged in', () => {
    mockAuthService.getCurrentUser.and.returnValue(null);

    component.ngOnInit();

    expect(component.userName()).toBe('Guest');
  });
});
