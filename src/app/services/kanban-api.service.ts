import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Board, Task, Column } from '../models/board.model';
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

  createBoard(boardData: { name: string; columns?: { name: string }[] }): Observable<Board> {
    return this.http.post<any>(`${this.baseUrl}/boards`, boardData).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  updateBoard(id: string, boardData: { name: string }): Observable<Board> {
    return this.http.put<any>(`${this.baseUrl}/boards/${id}`, boardData).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  deleteBoard(id: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/boards/${id}`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  createColumn(boardId: string, name: string): Observable<Column> {
    return this.http.post<any>(`${this.baseUrl}/boards/${boardId}/columns`, { name }).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  deleteColumn(columnId: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/columns/${columnId}`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  createTask(taskData: {
    columnId: string;
    title: string;
    description?: string;
    subtasks?: { title: string; isCompleted?: boolean }[];
  }): Observable<Task> {
    return this.http.post<any>(`${this.baseUrl}/tasks`, taskData).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  updateTask(
    taskId: string,
    taskData: {
      title?: string;
      description?: string;
      status?: string;
      subtasks?: { title: string; isCompleted?: boolean }[];
    }
  ): Observable<Task> {
    return this.http.put<any>(`${this.baseUrl}/tasks/${taskId}`, taskData).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  deleteTask(taskId: string): Observable<void> {
    return this.http.delete<any>(`${this.baseUrl}/tasks/${taskId}`).pipe(
      map((res) => (res && res.data ? res.data : res))
    );
  }

  moveTask(taskId: string, targetColumnId: string, newPosition: number): Observable<Task> {
    return this.http
      .patch<any>(`${this.baseUrl}/tasks/${taskId}/move`, { targetColumnId, newPosition })
      .pipe(map((res) => (res && res.data ? res.data : res)));
  }
}
