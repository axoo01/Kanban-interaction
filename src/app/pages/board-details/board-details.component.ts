import { Component, input, inject, computed } from '@angular/core';
import { BoardService } from '../../services/board.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-details.component.html',
  styleUrl: './board-details.component.scss'
})
export class BoardDetailsComponent {
  private boardService = inject(BoardService);
  id = input.required<string>();
  currentBoard = computed(() => this.boardService.getBoardById(this.id()));

  // Helper to determine the dot color class
  getColumnColorClass(name: string): string {
    const status = name.toLowerCase();
    if (status.includes('todo')) return 'todo';
    if (status.includes('doing')) return 'doing';
    if (status.includes('done')) return 'done';
    return 'custom';
  }
}