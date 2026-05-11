import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import data from '../../../public/data.json';

// 1. Define the shape of our Global State
interface BoardState {
  boards: any[];
  activeBoardId: string;
}

@Injectable({ providedIn: 'root' })
export class BoardService {
  // 2. Initialize Internal State
  private initialState: BoardState = {
    boards: data.boards,
    activeBoardId: ''
  };

  // 3. The BehaviorSubject (Private Source of Truth)
  private state = new BehaviorSubject<BoardState>(this.initialState);

  // 4. Public Observables (The "Streams" components listen to)
  state$ = this.state.asObservable();
  
  boards$ = this.state$.pipe(map(s => s.boards));
  
  currentBoard$ = this.state$.pipe(
    map(s => s.boards.find(
      b => b.name.toLowerCase().replace(/ /g, '-') === s.activeBoardId
    ))
  );

  // 5. Helper to get the raw current value when needed for logic
  private get currentState() {
    return this.state.getValue();
  }

  // --- BOARD ACTIONS ---

  setActiveBoard(id: string) {
    this.state.next({ ...this.currentState, activeBoardId: id });
  }

  addBoard(boardData: any) {
    const newBoard = {
      name: boardData.name,
      columns: boardData.columns.map((colName: string) => ({ name: colName, tasks: [] }))
    };
    this.state.next({
      ...this.currentState,
      boards: [...this.currentState.boards, newBoard]
    });
  }

  updateBoard(oldName: string, updatedBoard: any) {
    const updatedBoards = this.currentState.boards.map(board => {
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
    const filtered = this.currentState.boards.filter(b => b.name !== boardName);
    this.state.next({ ...this.currentState, boards: filtered });
  }

  // --- TASK ACTIONS ---

  addTask(boardId: string, task: any) {
    const updatedBoards = this.currentState.boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        const column = board.columns.find(col => col.name === task.status);
        if (column) {
          column.tasks = [...column.tasks, this.formatTask(task)];
        }
      }
      return board;
    });
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  updateTask(boardId: string, oldTaskTitle: string, updatedTask: any) {
    const updatedBoards = this.currentState.boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        board.columns.forEach(col => {
          const taskIndex = col.tasks.findIndex(t => t.title === oldTaskTitle);
          if (taskIndex !== -1) {
            if (col.name !== updatedTask.status) {
              // Move to new column
              col.tasks.splice(taskIndex, 1);
              const newCol = board.columns.find(c => c.name === updatedTask.status);
              newCol?.tasks.push(this.formatTask(updatedTask));
            } else {
              // Update in place
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
    const updatedBoards = this.currentState.boards.map(board => ({
      ...board,
      columns: board.columns.map(col => col.name === columnStatus 
        ? { ...col, tasks: col.tasks.filter(t => t.title !== taskTitle) } 
        : col
      )
    }));
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  moveTask(task: any, oldStatus: string, newStatus: string) {
    const updatedBoards = this.currentState.boards.map(board => ({
      ...board,
      columns: board.columns.map(col => {
        if (col.name === oldStatus) return { ...col, tasks: col.tasks.filter(t => t.title !== task.title) };
        if (col.name === newStatus) return { ...col, tasks: [...col.tasks, { ...task, status: newStatus }] };
        return col;
      })
    }));
    this.state.next({ ...this.currentState, boards: updatedBoards });
  }

  private formatTask(formValue: any) {
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