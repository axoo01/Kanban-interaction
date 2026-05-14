import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BoardActions } from './board.actions';
import { map, of, delay, catchError } from 'rxjs';
import data from '../../../../public/data.json';
import { Board } from '../../models/board.model';

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);

  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      delay(2000), 
      map(() => {
        const boards = data.boards as Board[];
        return BoardActions.loadBoardsSuccess({ boards });
      }),
      catchError((error) => 
        of(BoardActions.loadBoardsFailure({ error: error.message }))
      )
    )
  );
}