import { Routes } from '@angular/router';
import { LayoutShellComponent } from './components/layout-shell/layout-shell.component';
import { BoardListComponent } from './pages/board-list/board-list.component';
import { BoardDetailsComponent } from './pages/board-details/board-details.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutShellComponent,
    children: [
      { 
        path: '', 
        redirectTo: 'boards', 
        pathMatch: 'full' 
      },
      { 
        path: 'boards', 
        component: BoardListComponent 
      },
      { 
        path: 'boards/:id', 
        component: BoardDetailsComponent 
      },
      { 
        path: 'settings', 
        component: SettingsComponent 
      },
    ]
  },
  { 
    path: '**', 
    component: NotFoundComponent 
  }
];