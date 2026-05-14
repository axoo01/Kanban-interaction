import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BoardActions } from './board.actions';
import { Store } from '@ngrx/store';
import { map, of, delay, catchError, tap, withLatestFrom } from 'rxjs';
import { selectAllBoards } from './board.selectors';
import data from '../../../../public/data.json';
import { Board } from '../../models/board.model';

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);

  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      delay(1500), 
      map(() => {
        const saved = localStorage.getItem('kanban_state');
        const boards = saved ? JSON.parse(saved) : data.boards;
        return BoardActions.loadBoardsSuccess({ boards: boards as Board[] });
      }),
      catchError((error) => 
        of(BoardActions.loadBoardsFailure({ error: error.message }))
      )
    )
  );

  
  persistData$ = createEffect(() =>
    this.actions$.pipe(
      ofType(
        BoardActions.addBoard, BoardActions.updateBoard, BoardActions.deleteBoard,
        BoardActions.addTask, BoardActions.updateTask, BoardActions.deleteTask, BoardActions.moveTask
      ),
      withLatestFrom(this.store.select(selectAllBoards)),
      tap(([action, boards]) => {
        localStorage.setItem('kanban_state', JSON.stringify(boards));
      })
    ),
    { dispatch: false }
  );
}