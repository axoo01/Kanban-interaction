import { createFeatureSelector, createSelector } from '@ngrx/store';
import { BoardState } from './board.reducer';
import { Board } from '../../models/board.model';

export const selectBoardState = createFeatureSelector<BoardState>('board');

export const selectAllBoards = createSelector(
  selectBoardState,
  (state: BoardState): Board[] => state.boards
);

export const selectActiveBoardId = createSelector(
  selectBoardState,
  (state: BoardState): string => state.activeBoardId
);

export const selectIsLoading = createSelector(
  selectBoardState,
  (state: BoardState): boolean => state.isLoading
);

export const selectBoardError = createSelector(
  selectBoardState,
  (state: BoardState): string | null => state.error
);

export const selectCurrentBoard = createSelector(
  selectAllBoards,
  selectActiveBoardId,
  (boards: Board[], activeId: string): Board | undefined => boards.find(
    (b: Board) => b.name.toLowerCase().replace(/ /g, '-') === activeId
  )
);