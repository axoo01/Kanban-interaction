import { Component, input, inject, computed, effect } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';

@Component({
  selector: 'app-board-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-details.component.html',
  styleUrl: './board-details.component.scss'
})
export class BoardDetailsComponent {
  private dialogService = inject(DialogService);
  private boardService = inject(BoardService);
  
  id = input.required<string>();
  currentBoard = computed(() => this.boardService.getBoardById(this.id()));

  constructor() {
    // Synchronize the component's route ID with the service state
    effect(() => {
      this.boardService.setActiveBoard(this.id());
    });
  }

  // Helper for the column header dot colors
  getColumnColorClass(name: string): string {
    const status = name.toLowerCase();
    if (status.includes('todo')) return 'todo';
    if (status.includes('doing')) return 'doing';
    if (status.includes('done')) return 'done';
    return 'custom';
  }
  openTaskDetail(task: any) {
    console.log('CLICK DETECTED: Opening task...', task.title);
    this.dialogService.openViewTaskModal(task);
  }
  getCompletedSubtasks(task: any): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter((s: any) => s.isCompleted).length;
  }
  openEditModal(task: any) {
    this.dialogService.openTaskModal('edit', task); 
  }
}