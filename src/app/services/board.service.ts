import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Board, Column, Task } from '../models/board.model'; 
import data from '../../../public/data.json';

interface BoardState {
  boards: Board[];
  activeBoardId: string;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  private initialState: BoardState = {
    boards: data.boards as Board[],
    activeBoardId: ''
  };

  private state = new BehaviorSubject<BoardState>(this.initialState);
  state$ = this.state.asObservable();
  
  boards$ = this.state$.pipe(map(s => s.boards));
  
  currentBoard$ = this.state$.pipe(
    map(s => s.boards.find(
      (b: Board) => b.name.toLowerCase().replace(/ /g, '-') === s.activeBoardId
    ))
  );

  private get currentState() {
    return this.state.getValue();
  }

  setActiveBoard(id: string) {
    this.state.next({ ...this.currentState, activeBoardId: id });
  }

  addBoard(boardData: any) {
    const newBoard: Board = {
      name: boardData.name,
      columns: boardData.columns.map((colName: string) => ({ name: colName, tasks: [] }))
    };
    this.state.next({
      ...this.currentState,
      boards: [...this.currentState.boards, newBoard]
    });
  }

  updateBoard(oldName: string, updatedBoard: any) {
    const updatedBoards = this.currentState.boards.map((board: Board) => {
      if (board.name === oldName) {
        return {
          ...board,
          name: updatedBoard.name,
          columns: updatedBoard.columns.map((colName: string, index: number) => {
            const existingCol = board.columns[index];
            return { name: colName, tasks: existingCol ? existingCol.tasks : [] };
          })
        };
      }
      return board;
    });
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  deleteBoard(boardName: string) {
    const filtered = this.currentState.boards.filter((b: Board) => b.name !== boardName);
    this.state.next({ ...this.currentState, boards: filtered });
  }

  addTask(boardId: string, taskValue: any) {
    const updatedBoards = this.currentState.boards.map((board: Board) => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        const column = board.columns.find((col: Column) => col.name === taskValue.status);
        if (column) {
          column.tasks = [...column.tasks, this.formatTask(taskValue)];
        }
      }
      return board;
    });
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  updateTask(boardId: string, oldTaskTitle: string, updatedTask: any) {
    const updatedBoards = this.currentState.boards.map((board: Board) => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        board.columns.forEach((col: Column) => {
          const taskIndex = col.tasks.findIndex((t: Task) => t.title === oldTaskTitle);
          if (taskIndex !== -1) {
            if (col.name !== updatedTask.status) {
              col.tasks.splice(taskIndex, 1);
              const newCol = board.columns.find((c: Column) => c.name === updatedTask.status);
              newCol?.tasks.push(this.formatTask(updatedTask));
            } else {
              col.tasks[taskIndex] = this.formatTask(updatedTask);
            }
          }
        });
      }
      return board;
    });
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  deleteTask(taskTitle: string, columnStatus: string) {
    const updatedBoards = this.currentState.boards.map((board: Board) => ({
      ...board,
      columns: board.columns.map((col: Column) => col.name === columnStatus 
        ? { ...col, tasks: col.tasks.filter((t: Task) => t.title !== taskTitle) } 
        : col
      )
    }));
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  moveTask(task: Task, oldStatus: string, newStatus: string) {
    const updatedBoards = this.currentState.boards.map((board: Board) => ({
      ...board,
      columns: board.columns.map((col: Column) => {
        if (col.name === oldStatus) return { ...col, tasks: col.tasks.filter((t: Task) => t.title !== task.title) };
        if (col.name === newStatus) return { ...col, tasks: [...col.tasks, { ...task, status: newStatus }] };
        return col;
      })
    }));
    this.state.next({ ...this.currentState, boards: updatedBoards });
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