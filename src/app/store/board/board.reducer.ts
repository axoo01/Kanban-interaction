import { createReducer, on } from '@ngrx/store';
import { BoardActions } from './board.actions';
import { Board, Column, Task } from '../../models/board.model';
import data from '../../../../public/data.json';

export interface BoardState {
  boards: Board[];
  activeBoardId: string;
}

export const initialState: BoardState = {
  boards: data.boards as Board[],
  activeBoardId: ''
};

export const boardReducer = createReducer(
  initialState,

  on(BoardActions.selectBoard, (state, { boardId }) => ({
    ...state,
    activeBoardId: boardId
  })),

  on(BoardActions.addBoard, (state, { board }) => {
    const newBoard: Board = {
      name: board.name,
      columns: board.columns.map((colName: string) => ({ name: colName, tasks: [] }))
    };
    return { ...state, boards: [...state.boards, newBoard] };
  }),

  on(BoardActions.updateBoard, (state, { oldName, updatedBoard }) => ({
    ...state,
    boards: state.boards.map(b => b.name === oldName ? {
      ...b,
      name: updatedBoard.name,
      columns: updatedBoard.columns.map((colName: string, index: number) => ({
        name: colName,
        tasks: b.columns[index] ? b.columns[index].tasks : []
      }))
    } : b)
  })),

  on(BoardActions.deleteBoard, (state, { boardName }) => ({
    ...state,
    boards: state.boards.filter(b => b.name !== boardName)
  })),

  on(BoardActions.addTask, (state, { boardId, task }) => ({
    ...state,
    boards: state.boards.map(b => {
      if (b.name.toLowerCase().replace(/ /g, '-') === boardId) {
        return {
          ...b,
          columns: b.columns.map(col => col.name === task.status 
            ? { ...col, tasks: [...col.tasks, task] } 
            : col
          )
        };
      }
      return b;
    })
  })),

  on(BoardActions.updateTask, (state, { boardId, oldTaskTitle, updatedTask }) => ({
    ...state,
    boards: state.boards.map(b => {
      if (b.name.toLowerCase().replace(/ /g, '-') === boardId) {
        
        const newCols = b.columns.map(col => {
          const taskIdx = col.tasks.findIndex(t => t.title === oldTaskTitle);
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

        
        const finalCols = newCols.map(col => {
          if (col.name === updatedTask.status && !col.tasks.some(t => t.title === updatedTask.title)) {
            return { ...col, tasks: [...col.tasks, updatedTask] };
          }
          return col;
        });

        return { ...b, columns: finalCols };
      }
      return b;
    })
  })),

  on(BoardActions.deleteTask, (state, { taskTitle, columnStatus }) => ({
    ...state,
    boards: state.boards.map(board => ({
      ...board,
      columns: board.columns.map(col => col.name === columnStatus 
        ? { ...col, tasks: col.tasks.filter(t => t.title !== taskTitle) } 
        : col
      )
    }))
  })),

  on(BoardActions.moveTask, (state, { task, oldStatus, newStatus }) => ({
    ...state,
    boards: state.boards.map(board => ({
      ...board,
      columns: board.columns.map(col => {
        if (col.name === oldStatus) return { ...col, tasks: col.tasks.filter(t => t.title !== task.title) };
        if (col.name === newStatus) return { ...col, tasks: [...col.tasks, { ...task, status: newStatus }] };
        return col;
      })
    }))
  }))
);