import { Injectable, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { BoardActions } from '../store/board/board.actions';
import { selectAllBoards, selectCurrentBoard, selectActiveBoardId, selectIsLoading, selectBoardError } from '../store/board/board.selectors';
import { Board, Task } from '../models/board.model';

@Injectable({ providedIn: 'root' })
export class BoardService {
  private store = inject(Store);

  boards$ = this.store.select(selectAllBoards);
  currentBoard$ = this.store.select(selectCurrentBoard);
  activeBoardId$ = this.store.select(selectActiveBoardId);
  isLoading$ = this.store.select(selectIsLoading); 
  error$ = this.store.select(selectBoardError); 

  constructor() {
    this.store.dispatch(BoardActions.loadBoards());
  }

 
  setActiveBoard(id: string) {
  this.store.dispatch(BoardActions.selectBoard({ boardId: id }));
}
  addBoard(boardData: any) {
    this.store.dispatch(BoardActions.addBoard({ board: boardData }));
  }

  updateBoard(oldName: string, updatedBoard: any) {
    this.store.dispatch(BoardActions.updateBoard({ oldName, updatedBoard }));
  }

  deleteBoard(boardName: string) {
    this.store.dispatch(BoardActions.deleteBoard({ boardName }));
  }

  addTask(boardId: string, task: any) {
    this.store.dispatch(BoardActions.addTask({ boardId, task: this.formatTask(task) }));
  }

  updateTask(boardId: string, oldTaskTitle: string, updatedTask: any) {
    this.store.dispatch(BoardActions.updateTask({ 
      boardId, 
      oldTaskTitle, 
      updatedTask: this.formatTask(updatedTask) 
    }));
  }

  deleteTask(taskTitle: string, columnStatus: string) {
    this.store.dispatch(BoardActions.deleteTask({ taskTitle, columnStatus }));
  }

  moveTask(task: Task, oldStatus: string, newStatus: string) {
    this.store.dispatch(BoardActions.moveTask({ task, oldStatus, newStatus }));
  }

  private formatTask(formValue: any): Task {
    return {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      subtasks: formValue.subtasks.map((s: any) => ({ 
        title: s.name || s.title || s, 
        isCompleted: s.isCompleted || false 
      }))
    };
  }
}