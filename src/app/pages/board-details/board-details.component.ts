import { Component, inject, Input } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { CommonModule } from '@angular/common';
import { DialogService } from '../../services/dialog.service';
import { Task, Board } from '../../models/board.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { CdkDragDrop, CdkDrag, CdkDropList, CdkDropListGroup } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-board-details',
  standalone: true,
  imports: [CommonModule, CdkDrag, CdkDropList, CdkDropListGroup],
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

  onRetry() {
    this.boardService.loadBoards();
  }

  // 2. The Board Signal: Connecting the component to the global state with high performance
  board = toSignal(this.boardService.currentBoard$);

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
    this.boardService.currentBoard$.subscribe(board => {
      if (board) {
        this.dialogService.openBoardModal('edit', board);
      }
    }).unsubscribe();
  }

  onTaskDropped(event: CdkDragDrop<Task[]>) {
    if (
      event.previousContainer === event.container &&
      event.previousIndex === event.currentIndex
    ) {
      return;
    }

    const previousColumnName = event.previousContainer.id;
    const currentColumnName = event.container.id;

    this.boardService.moveTask(
      previousColumnName,
      currentColumnName,
      event.previousIndex,
      event.currentIndex
    );
  }
}