import { Component, signal, inject, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';

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

  // src/app/components/layout-shell/layout-shell.component.ts

openAddTask() {
  console.log('DEBUG: Add Task Clicked'); // <--- LOG 1
  this.dialogService.openTaskModal('add');
}

openCreateBoard() {
  console.log('DEBUG: Create Board Clicked'); // <--- LOG 2
  this.dialogService.openBoardModal('add');
}

openEditBoard() {
  console.log('DEBUG: 3-Dots/Edit Board Clicked'); // <--- LOG 3
  const currentBoard = this.boardService.getCurrentBoard(); 
  console.log('DEBUG: Current Board Data:', currentBoard); // <--- LOG 4
  if (currentBoard) {
    this.dialogService.openBoardModal('edit', currentBoard);
  }
}

onDeleteBoard() {
    console.log('Delete Board clicked - logic coming soon!');
  }
}