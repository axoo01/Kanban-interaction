import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardState } from './board.reducer';
import { Board } from '../../models/board.model';


export const selectBoardState = createFeatureSelector<BoardState>('board');


export const selectAllBoards = createSelector(
  selectBoardState,
  (state: BoardState) => state.boards
);


export const selectActiveBoardId = createSelector(
  selectBoardState,
  (state: BoardState) => state.activeBoardId
);


export const selectCurrentBoard = createSelector(
  selectAllBoards,
  selectActiveBoardId,
  (boards: Board[], activeId: string) => boards.find(
    b => b.name.toLowerCase().replace(/ /g, '-') === activeId
  )
);