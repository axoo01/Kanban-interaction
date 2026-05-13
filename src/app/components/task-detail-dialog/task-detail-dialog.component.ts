import { Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-task-detail-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './task-detail-dialog.component.html',
  styleUrl: './task-detail-dialog.component.scss'
})
export class TaskDetailDialogComponent implements OnInit {
  public dialogService = inject(DialogService);
  public boardService = inject(BoardService);
  
  
  task = signal(this.dialogService.state().data);
  isOptionsMenuOpen = signal(false);
  isStatusDropdownOpen = signal(false);

  
  columns$ = this.boardService.currentBoard$.pipe(
    map(board => board?.columns || [])
  );

  completedCount = computed(() => {
    return this.task().subtasks?.filter((s: any) => s.isCompleted).length || 0;
  });

  ngOnInit() {
   
    this.task.set(this.dialogService.state().data);
  }

  toggleStatusDropdown() {
    this.isStatusDropdownOpen.update(v => !v);
  }

  updateStatus(newStatus: string) {
    const currentTask = this.task();
    const oldStatus = currentTask.status;
    if (oldStatus === newStatus) return;

    // Update local state for immediate UI feedback
    const updatedTask = { ...currentTask, status: newStatus };
    this.task.set(updatedTask);
    
    // Update global state
    this.boardService.moveTask(updatedTask, oldStatus, newStatus);
    this.isStatusDropdownOpen.set(false);
  }

  toggleSubtask(subtask: any) {
  
    subtask.isCompleted = !subtask.isCompleted;
    const updatedTask = { ...this.task() };
    this.task.set(updatedTask);

   
    this.boardService.currentBoard$.pipe(map(board => {
        if (board) {
            const boardId = board.name.toLowerCase().replace(/ /g, '-');
            this.boardService.updateTask(boardId, updatedTask.title, updatedTask);
        }
    })).subscribe().unsubscribe();
  }

  openEditForm() {
    this.isOptionsMenuOpen.set(false);
    this.dialogService.openTaskModal('edit', this.task());
  }

  openDeleteTask() {
    this.isOptionsMenuOpen.set(false); 
    this.dialogService.openDeleteModal({
      title: 'Delete this task?',
      message: `Are you sure you want to delete the '${this.task().title}' task?`,
      onConfirm: () => {
        this.boardService.deleteTask(this.task().title, this.task().status);
        this.dialogService.close();
      }
    });
  }
}