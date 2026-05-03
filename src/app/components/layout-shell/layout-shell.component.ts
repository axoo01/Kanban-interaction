import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.scss'
})
export class LayoutShellComponent {
  private themeService = inject(ThemeService);
  isDarkMode = this.themeService.darkMode;
  private dialogService = inject(DialogService);
  boardService = inject(BoardService);
  private router = inject(Router);

  headerTitle = computed(() => 
    this.boardService.getCurrentBoard()?.name || 'Platform Launch'
  );

  boards = this.boardService.boards;
  isSidebarHidden = signal(false);
  isOptionsMenuOpen = signal(false);

  toggleOptionsMenu() {
    this.isOptionsMenuOpen.update(val => !val);
  }

  toggleSidebar() {
    this.isSidebarHidden.update(val => !val);
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }



openAddTask() {
  this.dialogService.openTaskModal('add');
}

openCreateBoard() {
  this.dialogService.openBoardModal('add');
}

openEditBoard() {
  const currentBoard = this.boardService.getCurrentBoard(); 
  if (currentBoard) {
    this.dialogService.openBoardModal('edit', currentBoard);
  }
}

onDeleteBoard() {
  const currentBoard = this.boardService.getCurrentBoard();
  if (!currentBoard) return;

  this.isOptionsMenuOpen.set(false); // Close the 3-dot menu first

  this.dialogService.openDeleteModal({
    title: 'Delete this board?',
    message: `Are you sure you want to delete the '${currentBoard.name}' board? This action will remove all columns and tasks and cannot be reversed.`,
    onConfirm: () => {
      this.boardService.deleteBoard(currentBoard.name);
      
      // Navigate to first board
      const remaining = this.boardService.boards();
      if (remaining.length > 0) {
        const nextId = remaining[0].name.toLowerCase().replace(/ /g, '-');
        this.router.navigate(['/boards', nextId]);
      } else {
        this.router.navigate(['/']);
      }
    }
  });
}
}