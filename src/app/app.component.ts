import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, ActivatedRoute } from '@angular/router';
import { TaskFormDialogComponent } from './components/task-form-dialog/task-form-dialog.component';
import { BoardFormDialogComponent } from './components/board-form-dialog/board-form-dialog.component';
import { DialogService } from './services/dialog.service';
import { BoardService } from './services/board.service';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { TaskDetailDialogComponent } from './components/task-detail-dialog/task-detail-dialog.component';
import { combineLatest } from 'rxjs';
import { Task } from './models/board.model';

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
      @switch (dialogService.state().type) {
        @case ('task') { <app-task-form-dialog /> }
        @case ('board') { <app-board-form-dialog /> }
        @case ('delete') { <app-confirm-dialog /> }
        @case ('view') { <app-task-detail-dialog /> } }
    }
  `,
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  dialogService = inject(DialogService);
  private route = inject(ActivatedRoute);
  private boardService = inject(BoardService);

  ngOnInit() {
    combineLatest([
      this.route.queryParams,
      this.boardService.boards$,
      this.boardService.activeBoardId$
    ]).subscribe(([params, boards, activeBoardId]) => {
      const modal = params['modal'];
      const taskTitle = params['task'];

      if (!modal) {
        if (this.dialogService.state().isOpen && this.dialogService.state().type !== 'delete') {
          this.dialogService.setRawState({ isOpen: false, type: 'task', mode: 'add' });
        }
        return;
      }

      if (!boards || boards.length === 0) {
        return;
      }

      const activeBoard = boards.find(
        (b) => b.id === activeBoardId || b.name.toLowerCase().replace(/ /g, '-') === activeBoardId
      );

      if (modal === 'add-board') {
        this.dialogService.setRawState({ isOpen: true, type: 'board', mode: 'add' });
      } else if (modal === 'edit-board') {
        if (activeBoard) {
          this.dialogService.setRawState({ isOpen: true, type: 'board', mode: 'edit', data: activeBoard });
        }
      } else if (modal === 'add-task') {
        this.dialogService.setRawState({ isOpen: true, type: 'task', mode: 'add' });
      } else if (modal === 'edit-task' && taskTitle) {
        let foundTask: Task | undefined;
        activeBoard?.columns.forEach((col) => {
          const t = col.tasks.find((tk) => tk.title === taskTitle);
          if (t) foundTask = t;
        });
        if (foundTask) {
          this.dialogService.setRawState({ isOpen: true, type: 'task', mode: 'edit', data: foundTask });
        }
      } else if (modal === 'view-task' && taskTitle) {
        let foundTask: Task | undefined;
        activeBoard?.columns.forEach((col) => {
          const t = col.tasks.find((tk) => tk.title === taskTitle);
          if (t) foundTask = t;
        });
        if (foundTask) {
          this.dialogService.setRawState({ isOpen: true, type: 'view', mode: 'edit', data: foundTask });
        }
      }
    });
  }
}