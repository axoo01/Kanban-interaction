import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TaskFormDialogComponent } from './components/task-form-dialog/task-form-dialog.component';
import { BoardFormDialogComponent } from './components/board-form-dialog/board-form-dialog.component'; // 1. IMPORT THIS
import { DialogService } from './services/dialog.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TaskDetailDialogComponent } from './components/task-detail-dialog/task-detail-dialog.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule, 
    RouterOutlet, 
    TaskFormDialogComponent, 
    BoardFormDialogComponent,
    ConfirmDialogComponent,
    TaskDetailDialogComponent
  ], 
  template: `
    <router-outlet />

    @if (dialogService.state().isOpen) {
      @if (dialogService.state().isOpen) {
        @switch (dialogService.state().type) {
          @case ('task') { <app-task-form-dialog /> }
          @case ('board') { <app-board-form-dialog /> }
          @case ('delete') { <app-confirm-dialog /> }
          @case ('view') { <app-task-detail-dialog /> } }
      }
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent {
  dialogService = inject(DialogService);
}