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

  // 1. Set loading for all trigger actions
  on(
    BoardActions.loadBoards,
    BoardActions.addBoard,
    BoardActions.updateBoard,
    BoardActions.deleteBoard,
    BoardActions.addTask,
    BoardActions.updateTask,
    BoardActions.deleteTask,
    BoardActions.moveTask,
    (state): BoardState => ({
      ...state,
      isLoading: true,
      error: null
    })
  ),

  // 2. Set error state for all failure actions
  on(
    BoardActions.loadBoardsFailure,
    BoardActions.addBoardFailure,
    BoardActions.updateBoardFailure,
    BoardActions.deleteBoardFailure,
    BoardActions.addTaskFailure,
    BoardActions.updateTaskFailure,
    BoardActions.deleteTaskFailure,
    BoardActions.moveTaskFailure,
    (state, { error }): BoardState => ({
      ...state,
      isLoading: false,
      error
    })
  ),

  // 3. Navigation / Selection
  on(BoardActions.selectBoard, (state, { boardId }): BoardState => ({
    ...state,
    activeBoardId: boardId
  })),

  // 4. Success handlers
  on(BoardActions.loadBoardsSuccess, (state, { boards }): BoardState => ({
    ...state,
    boards,
    isLoading: false
  })),

  on(BoardActions.addBoardSuccess, (state, { board }): BoardState => ({
    ...state,
    boards: [...state.boards, board],
    isLoading: false
  })),

  on(BoardActions.updateBoardSuccess, (state, { board }): BoardState => ({
    ...state,
    boards: state.boards.map((b: Board) => (b.id === board.id || b.name === board.name) ? board : b),
    isLoading: false
  })),

  on(BoardActions.deleteBoardSuccess, (state, { boardName }): BoardState => ({
    ...state,
    boards: state.boards.filter((b: Board) => b.name !== boardName),
    isLoading: false
  })),

  // All task updates replace the parent board returned by the backend
  on(
    BoardActions.addTaskSuccess,
    BoardActions.updateTaskSuccess,
    BoardActions.deleteTaskSuccess,
    BoardActions.moveTaskSuccess,
    (state, { board }): BoardState => ({
      ...state,
      boards: state.boards.map((b: Board) => b.id === board.id ? board : b),
      isLoading: false
    })
  )
);