import { Routes } from '@angular/router';
import { LayoutShellComponent } from './components/layout-shell/layout-shell.component';
// Import your guards
import { authGuard } from './guards/auth.guard';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    children: [
      { path: '', redirectTo: 'boards', pathMatch: 'full' },
      { 
        path: 'boards', 
        loadComponent: () => import('./pages/board-list/board-list.component').then(m => m.BoardListComponent) 
      },
      { 
        path: 'boards/:id', 
        loadComponent: () => import('./pages/board-details/board-details.component').then(m => m.BoardDetailsComponent),
        canDeactivate: [unsavedChangesGuard], // Requirement: Prevent losing unsaved changes
        children: [
          {
            path: 'tasks/:taskId',
            loadComponent: () => import('./pages/task-detail/task-detail.component').then(m => m.TaskDetailComponent)
          }
        ]
      },
      { 
        path: 'settings', 
        loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
        canActivate: [authGuard] // Requirement: Restrict access
      },
    ]
  },
  { 
    path: '**', 
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent) 
  }
];