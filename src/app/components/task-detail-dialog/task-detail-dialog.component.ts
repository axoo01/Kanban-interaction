import { Component, inject, signal, computed, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';

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

  // Watches for new columns automatically
  columns = computed(() => this.boardService.currentBoard()?.columns || []);

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
    const oldStatus = this.task().status;
    if (oldStatus === newStatus) return;

    this.task().status = newStatus;
    this.task.set({ ...this.task() });
    
    this.boardService.moveTask(this.task(), oldStatus, newStatus);
    this.isStatusDropdownOpen.set(false);
  }

  toggleSubtask(subtask: any) {
    subtask.isCompleted = !subtask.isCompleted;
    this.task.set({ ...this.task() });
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