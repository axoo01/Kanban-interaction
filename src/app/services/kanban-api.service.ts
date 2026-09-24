import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Board, Task } from '../models/board.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class KanbanApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getBoards(): Observable<Board[]> {
    return this.http.get<any>(`${this.baseUrl}/boards`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  getBoardById(id: string): Observable<Board> {
    return this.http.get<any>(`${this.baseUrl}/boards/${id}`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  createBoard(board: Partial<Board>): Observable<Board> {
    return this.http.post<any>(`${this.baseUrl}/boards`, board).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  updateBoard(id: string, board: Partial<Board>): Observable<Board> {
    return this.http.put<any>(`${this.baseUrl}/boards/${id}`, board).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/boards/${id}`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  moveTask(taskId: string, targetColumnId: string, newPosition: number): Observable<Task> {
    return this.http.patch<any>(`${this.baseUrl}/tasks/${taskId}/move`, { targetColumnId, newPosition }).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }
}
