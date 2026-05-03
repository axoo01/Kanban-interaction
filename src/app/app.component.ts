import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TaskFormDialogComponent } from './components/task-form-dialog/task-form-dialog.component';
import { BoardFormDialogComponent } from './components/board-form-dialog/board-form-dialog.component'; // 1. IMPORT THIS
import { DialogService } from './services/dialog.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet, 
    TaskFormDialogComponent, 
    BoardFormDialogComponent // 2. ADD TO IMPORTS
  ], 
  template: `
    <router-outlet />

    @if (dialogService.state().isOpen) {
      @if (dialogService.state().type === 'task') {
        <app-task-form-dialog />
      } @else {
        <app-board-form-dialog />
      }
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  dialogService = inject(DialogService);
}