import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { BoardService } from '../../services/board.service';

@Component({
  selector: 'app-auth-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-dialog.component.html',
  styleUrl: './auth-dialog.component.scss'
})
export class AuthDialogComponent {
  public authService = inject(AuthService);
  private boardService = inject(BoardService);

  activeTab = signal<'login' | 'register'>('login');
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  loginEmail = 'developer@kanban.local';
  loginPassword = 'Password123!';

  regFullName = '';
  regEmail = '';
  regPassword = '';

  setTab(tab: 'login' | 'register') {
    this.activeTab.set(tab);
    this.errorMessage.set(null);
  }

  onLogin() {
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Please fill in email and password.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginEmail, this.loginPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.boardService.loadBoards();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Login failed. Please check your credentials.');
      }
    });
  }

  onRegister() {
    if (!this.regFullName || !this.regEmail || !this.regPassword) {
      this.errorMessage.set('Please fill in all registration fields.');
      return;
    }
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.register(this.regFullName, this.regEmail, this.regPassword).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.boardService.loadBoards();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }

  onQuickLogin(role: 'admin' | 'dev') {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.authService.quickDemoLogin(role).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.boardService.loadBoards();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Quick login failed.');
      }
    });
  }
}
