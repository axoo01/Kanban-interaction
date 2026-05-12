import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardState } from './board.reducer';

// 1. Grab the entire "board" slice of state
export const selectBoardState = createFeatureSelector<BoardState>('board');

// 2. Select the boards array
export const selectAllBoards = createSelector(
  selectBoardState,
  (state) => state.boards
);

// 3. Select the active board ID
export const selectActiveBoardId = createSelector(
  selectBoardState,
  (state) => state.activeBoardId
);

// 4. The "Big One": Select the current board object based on the ID
export const selectCurrentBoard = createSelector(
  selectAllBoards,
  selectActiveBoardId,
  (boards, activeId) => boards.find(
    b => b.name.toLowerCase().replace(/ /g, '-') === activeId
  )
);