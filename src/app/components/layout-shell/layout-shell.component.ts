import { Component, signal, inject, HostListener, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';
import { DialogService } from '../../services/dialog.service';
import { BoardService } from '../../services/board.service';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs';

@Component({
  selector: 'app-layout-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './layout-shell.component.html',
  styleUrl: './layout-shell.component.scss'
})
export class LayoutShellComponent implements OnInit {
  private themeService = inject(ThemeService);
  private dialogService = inject(DialogService);
  private router = inject(Router);
  public boardService = inject(BoardService); 

  
  boards$ = this.boardService.boards$;
  
  
  headerTitle$ = this.boardService.currentBoard$.pipe(
    map(board => board?.name || 'Platform Launch')
  );

  
  isDarkMode = this.themeService.darkMode;
  isSidebarHidden = signal(false);
  isOptionsMenuOpen = signal(false);
  isMobileSidebarOpen = signal(false);
  isMobileView = signal(window.innerWidth <= 768);

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobileView.set(event.target.innerWidth <= 768);
    if (!this.isMobileView()) this.isMobileSidebarOpen.set(false);
  }

  ngOnInit() {}

  toggleMobileSidebar() {
    if (this.isMobileView()) {
      this.isMobileSidebarOpen.update(v => !v);
    }
  }

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
    this.isMobileSidebarOpen.set(false); 
    this.dialogService.openBoardModal('add');
  }

  

  openEditBoard() {
    
    this.boardService.currentBoard$.pipe(map(board => {
      if (board) this.dialogService.openBoardModal('edit', board);
    })).subscribe().unsubscribe(); 
  }

  onDeleteBoard() {
    this.boardService.currentBoard$.pipe(map(currentBoard => {
      if (!currentBoard) return;

      this.isOptionsMenuOpen.set(false); 

      this.dialogService.openDeleteModal({
        title: 'Delete this board?',
        message: `Are you sure you want to delete the '${currentBoard.name}' board?`,
        onConfirm: () => {
          this.boardService.deleteBoard(currentBoard.name);
          
          
          this.boardService.boards$.pipe(map(boards => {
            if (boards.length > 0) {
              const nextId = boards[0].name.toLowerCase().replace(/ /g, '-');
              this.router.navigate(['/boards', nextId]);
            } else {
              this.router.navigate(['/']);
            }
          })).subscribe().unsubscribe();
        }
      });
    })).subscribe().unsubscribe();
  }
}