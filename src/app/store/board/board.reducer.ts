import { createReducer, on } from '@ngrx/store';
import { BoardActions } from './board.actions';
import { Board, Column, Task } from '../../models/board.model';

export interface BoardState {
  boards: Board[];
  activeBoardId: string;
  isLoading: boolean;
  error: string | null; 
}

export const initialState: BoardState = {
  boards: [], 
  activeBoardId: '',
  isLoading: false,
  error: null
};

export const boardReducer = createReducer(
  initialState,

  
  on(BoardActions.loadBoards, (state): BoardState => ({
    ...state,
    isLoading: true,
    error: null
  })),

  on(BoardActions.loadBoardsSuccess, (state, { boards }): BoardState => ({
    ...state,
    boards,
    isLoading: false
  })),

  on(BoardActions.loadBoardsFailure, (state, { error }): BoardState => ({
    ...state,
    isLoading: false,
    error
  })),

  
  on(BoardActions.selectBoard, (state, { boardId }): BoardState => ({
    ...state,
    activeBoardId: boardId
  })),

  on(BoardActions.addBoard, (state, { board }): BoardState => {
    const newBoard: Board = {
      name: board.name,
      columns: board.columns.map((colName: string) => ({ name: colName, tasks: [] }))
    };
    return { ...state, boards: [...state.boards, newBoard] };
  }),

  on(BoardActions.updateBoard, (state, { oldName, updatedBoard }): BoardState => ({
    ...state,
    boards: state.boards.map((b: Board) => b.name === oldName ? {
      ...b,
      name: updatedBoard.name,
      columns: updatedBoard.columns.map((colName: string, index: number) => ({
        name: colName,
        tasks: b.columns[index] ? b.columns[index].tasks : []
      }))
    } : b)
  })),

  on(BoardActions.deleteBoard, (state, { boardName }): BoardState => ({
    ...state,
    boards: state.boards.filter((b: Board) => b.name !== boardName)
  })),

  on(BoardActions.addTask, (state, { boardId, task }): BoardState => ({
    ...state,
    boards: state.boards.map((b: Board) => {
      if (b.name.toLowerCase().replace(/ /g, '-') === boardId) {
        return {
          ...b,
          columns: b.columns.map((col: Column) => col.name === task.status 
            ? { ...col, tasks: [...col.tasks, task] } 
            : col
          )
        };
      }
      return b;
    })
  })),

  on(BoardActions.updateTask, (state, { boardId, oldTaskTitle, updatedTask }): BoardState => ({
    ...state,
    boards: state.boards.map((b: Board) => {
      if (b.name.toLowerCase().replace(/ /g, '-') === boardId) {
        const newCols = b.columns.map((col: Column) => {
          const taskIdx = col.tasks.findIndex((t: Task) => t.title === oldTaskTitle);
          if (taskIdx === -1) return col;

          const updatedTasks = [...col.tasks];
          if (col.name !== updatedTask.status) {
            updatedTasks.splice(taskIdx, 1);
            return { ...col, tasks: updatedTasks };
          } else {
            updatedTasks[taskIdx] = updatedTask;
            return { ...col, tasks: updatedTasks };
          }
        });

        const finalCols = newCols.map((col: Column) => {
          if (col.name === updatedTask.status && !col.tasks.some((t: Task) => t.title === updatedTask.title)) {
            return { ...col, tasks: [...col.tasks, updatedTask] };
          }
          return col;
        });

        return { ...b, columns: finalCols };
      }
      return b;
    })
  })),

  on(BoardActions.deleteTask, (state, { taskTitle, columnStatus }): BoardState => ({
    ...state,
    boards: state.boards.map((board: Board) => ({
      ...board,
      columns: board.columns.map((col: Column) => col.name === columnStatus 
        ? { ...col, tasks: col.tasks.filter((t: Task) => t.title !== taskTitle) } 
        : col
      )
    }))
  })),

  on(BoardActions.moveTask, (state, { task, oldStatus, newStatus }): BoardState => ({
    ...state,
    boards: state.boards.map((board: Board) => ({
      ...board,
      columns: board.columns.map((col: Column) => {
        if (col.name === oldStatus) return { ...col, tasks: col.tasks.filter((t: Task) => t.title !== task.title) };
        if (col.name === newStatus) return { ...col, tasks: [...col.tasks, { ...task, status: newStatus }] };
        return col;
      })
    }))
  }))
);