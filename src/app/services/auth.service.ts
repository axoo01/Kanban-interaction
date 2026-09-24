import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: string;
  themePreference?: string;
}

export interface AuthResponseData {
  user: UserProfile;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private tokenSignal = signal<string | null>(this.getStoredToken());
  private currentUserSignal = signal<UserProfile | null>(this.getStoredUser());

  readonly token = computed(() => this.tokenSignal());
  readonly currentUser = computed(() => this.currentUserSignal());
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor() {
    if (this.tokenSignal() && !this.currentUserSignal()) {
      this.fetchProfile().subscribe();
    }
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password }).pipe(
      tap((res) => {
        const data: AuthResponseData = res.data || res;
        this.handleAuthSuccess(data.token, data.user);
      })
    );
  }

  register(fullName: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/auth/register`, { fullName, email, password }).pipe(
      tap((res) => {
        const data: AuthResponseData = res.data || res;
        this.handleAuthSuccess(data.token, data.user);
      })
    );
  }

  fetchProfile(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/auth/me`).pipe(
      tap((res) => {
        const user = res.data || res;
        this.currentUserSignal.set(user);
        localStorage.setItem('kanban_user', JSON.stringify(user));
      }),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  quickDemoLogin(role: 'admin' | 'dev'): Observable<any> {
    const credentials =
      role === 'admin'
        ? { email: 'admin@kanban.local', password: 'Password123!' }
        : { email: 'developer@kanban.local', password: 'Password123!' };
    return this.login(credentials.email, credentials.password);
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    localStorage.removeItem('kanban_token');
    localStorage.removeItem('kanban_user');
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private handleAuthSuccess(token: string, user: UserProfile): void {
    this.tokenSignal.set(token);
    this.currentUserSignal.set(user);
    localStorage.setItem('kanban_token', token);
    localStorage.setItem('kanban_user', JSON.stringify(user));
  }

  private getStoredToken(): string | null {
    return localStorage.getItem('kanban_token');
  }

  private getStoredUser(): UserProfile | null {
    const raw = localStorage.getItem('kanban_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}
