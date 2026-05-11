import { Component, inject, Input, OnInit } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { Task, Board } from '../../models/board.model'; // Importing your models
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-board-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-details.component.html',
  styleUrl: './board-details.component.scss'
})
export class BoardDetailsComponent {
  private dialogService = inject(DialogService);
  public boardService = inject(BoardService);

  // 1. Reactive Input: This replaces the 'effect' and 'input.required'
  // Whenever the URL /boards/:id changes, this setter triggers.
  @Input() set id(boardId: string) {
    this.boardService.setActiveBoard(boardId);
  }

  // 2. The Board Stream: Connecting the component to the global state
  board$: Observable<Board | undefined> = this.boardService.currentBoard$;

  // --- RESTORED HELPER METHODS ---

  getColumnColorClass(name: string): string {
    const status = name.toLowerCase();
    if (status.includes('todo')) return 'todo';
    if (status.includes('doing')) return 'doing';
    if (status.includes('done')) return 'done';
    return 'custom';
  }

  getCompletedSubtasks(task: Task): number {
    if (!task.subtasks) return 0;
    return task.subtasks.filter(s => s.isCompleted).length;
  }

  // --- RESTORED ACTIONS ---

  openTaskDetail(task: Task) {
    this.dialogService.openViewTaskModal(task);
  }

  onAddNewColumn() {
    // We grab a quick snapshot of the current board to send to the modal
    this.boardService.currentBoard$.subscribe(board => {
      if (board) {
        this.dialogService.openBoardModal('edit', board);
      }
    }).unsubscribe();
  }
}