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

  on(BoardActions.deleteBoard, (state, { boardName }) => ({
    ...state,
    boards: state.boards.filter(b => b.name !== boardName)
  }))

  
);