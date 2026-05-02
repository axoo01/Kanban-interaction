import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router'; // 1. MUST IMPORT THIS
import { TaskFormDialogComponent } from './components/task-form-dialog/task-form-dialog.component';
import { DialogService } from './services/dialog.service';

@Component({
  standalone: true,
  selector: 'app-root',
  // 2. ADD RouterOutlet to imports
  imports: [CommonModule, RouterOutlet, TaskFormDialogComponent], 
  template: `
    <router-outlet />

    @if (dialogService.state().isOpen) {
      <app-task-form-dialog />
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  dialogService = inject(DialogService);
}