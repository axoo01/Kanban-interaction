import { Component, inject, signal, computed, OnInit } from '@angular/core'; // 1. Add OnInit here
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
export class TaskDetailDialogComponent implements OnInit { // 2. Add implements OnInit
  dialogService = inject(DialogService);
  boardService = inject(BoardService);
  
  task = signal(this.dialogService.state().data);
  isOptionsMenuOpen = signal(false);
  isStatusDropdownOpen = signal(false);

  columns = computed(() => this.boardService.getCurrentBoard()?.columns || []);

  completedCount = computed(() => {
    return this.task().subtasks.filter((s: any) => s.isCompleted).length;
  });

  // 3. ngOnInit goes here!
  ngOnInit() {
    console.log('VIEWING TASK:', this.task());
    // You can perform any check or data fetching here when the modal opens
  }

  toggleStatusDropdown() {
    this.isStatusDropdownOpen.update(v => !v);
  }

  openEditForm() {
    this.isOptionsMenuOpen.set(false);
    this.dialogService.openTaskModal('edit', this.task());
  }

  toggleSubtask(subtask: any) {
    subtask.isCompleted = !subtask.isCompleted;
    this.task.set({ ...this.task() });
    // In a real app, you'd trigger a boardService.updateTask here to save the state
  }

  // 4. Completed Delete Functionality
  openDeleteTask() {
    this.isOptionsMenuOpen.set(false); // Close the 3-dots menu

    this.dialogService.openDeleteModal({
      title: 'Delete this task?',
      message: `Are you sure you want to delete the '${this.task().title}' task and its subtasks? This action cannot be undone.`,
      onConfirm: () => {
        // We tell the service to remove this specific task
        this.boardService.deleteTask(this.task().title, this.task().status);
        this.dialogService.close(); // Close everything after deletion
      }
    });
  }
}