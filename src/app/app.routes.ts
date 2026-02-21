import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: 'welcome', pathMatch: 'full' },

  // Public routes (no auth required)
  {
    path: 'welcome',
    loadComponent: () =>
      import('./features/auth/welcome/welcome.component').then(m => m.WelcomeComponent)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },

  // Stakeholder routes (public)
  {
    path: 'stakeholder',
    loadComponent: () =>
      import('./features/stakeholder/stakeholder-info/stakeholder-info.component').then(m => m.StakeholderInfoComponent)
  },
  {
    path: 'limit-reached',
    loadComponent: () =>
      import('./features/stakeholder/limit-reached/limit-reached.component').then(m => m.LimitReachedComponent)
  },
  {
    path: 'create-request',
    loadComponent: () =>
      import('./features/stakeholder/create-request/create-request.component').then(m => m.CreateRequestComponent)
  },

  // Protected routes (auth required)
  {
    path: 'summary',
    loadComponent: () =>
      import('./features/summary/summary.component').then(m => m.SummaryComponent),
    canActivate: [authGuard]
  },
  {
    path: 'board',
    loadComponent: () =>
      import('./features/board/board.component').then(m => m.BoardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'add-task',
    loadComponent: () =>
      import('./features/add-task/add-task.component').then(m => m.AddTaskComponent),
    canActivate: [authGuard]
  },
  {
    path: 'contacts',
    loadComponent: () =>
      import('./features/contacts/contacts.component').then(m => m.ContactsComponent),
    canActivate: [authGuard]
  },

  // Legal pages (public)
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./features/legal/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent)
  },
  {
    path: 'legal-notice',
    loadComponent: () =>
      import('./features/legal/legal-notice/legal-notice.component').then(m => m.LegalNoticeComponent)
  },
  {
    path: 'help',
    loadComponent: () =>
      import('./features/legal/help/help.component').then(m => m.HelpComponent)
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'welcome' }
];
