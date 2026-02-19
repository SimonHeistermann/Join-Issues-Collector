import { Component, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { TaskService, AuthService } from '../../core/services';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [CommonModule, RouterModule, SidebarComponent, HeaderComponent],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss'
})
export class SummaryComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private subscriptions: Subscription[] = [];

  userName = signal('');
  timeOfDay = signal('');
  nextDeadline = signal<string | null>(null);
  mobileGreetingVisible = signal(false);
  mobileGreetingActive = signal(false);

  taskCounts = signal({
    triage: 0,
    todo: 0,
    inProgress: 0,
    awaitFeedback: 0,
    done: 0,
    urgent: 0,
    total: 0
  });

  ngOnInit(): void {
    this.setTimeOfDay();
    this.setUserName();
    this.loadTaskStats();
    if (window.innerWidth <= 768 && !sessionStorage.getItem('greetingShown')) {
      sessionStorage.setItem('greetingShown', '1');
      this.startMobileAnimation();
    }
  }

  isGuest(): boolean {
    const user = this.authService.getCurrentUser();
    return !user || user.email === 'guest';
  }

  private startMobileAnimation(): void {
    this.mobileGreetingVisible.set(true);
    setTimeout(() => this.mobileGreetingActive.set(true), 125);
    setTimeout(() => {
      this.mobileGreetingActive.set(false);
      setTimeout(() => this.mobileGreetingVisible.set(false), 125);
    }, 2000);
  }

  private setTimeOfDay(): void {
    const hour = new Date().getHours();
    if (hour < 12) {
      this.timeOfDay.set('morning');
    } else if (hour < 18) {
      this.timeOfDay.set('afternoon');
    } else {
      this.timeOfDay.set('evening');
    }
  }

  private setUserName(): void {
    const user = this.authService.getCurrentUser();
    this.userName.set(user?.name || 'Guest');
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  private loadTaskStats(): void {
    this.subscriptions.push(this.taskService.loadTasks().subscribe(tasks => {
      const counts = {
        triage: tasks.filter(t => t.status === 'triage').length,
        todo: tasks.filter(t => t.status === 'to-do').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        awaitFeedback: tasks.filter(t => t.status === 'await-feedback').length,
        done: tasks.filter(t => t.status === 'done').length,
        urgent: tasks.filter(t => t.prio === 3).length,
        total: tasks.length
      };
      this.taskCounts.set(counts);

      const urgentTasks = tasks.filter(t => t.prio === 3 && t.due_date);
      if (urgentTasks.length > 0) {
        const sorted = urgentTasks.sort((a, b) =>
          new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
        );
        this.nextDeadline.set(sorted[0].due_date);
      }
    }));
  }

  goToBoard(): void {
    this.router.navigate(['/board']);
  }

}
