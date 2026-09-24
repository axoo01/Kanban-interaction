import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BoardActions } from './board.actions';
import { Store } from '@ngrx/store';
import { map, of, catchError, concatMap, switchMap, withLatestFrom } from 'rxjs';
import { selectAllBoards, selectCurrentBoard } from './board.selectors';
import { Board } from '../../models/board.model';
import { KanbanApiService } from '../../services/kanban-api.service';

@Injectable()
export class BoardEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private apiService = inject(KanbanApiService);

  loadBoards$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.loadBoards),
      switchMap(() =>
        this.apiService.getBoards().pipe(
          map((boards) => BoardActions.loadBoardsSuccess({ boards })),
          catchError((error) =>
            of(BoardActions.loadBoardsFailure({ error: error.message || 'Failed to load boards' }))
          )
        )
      )
    )
  );

  addBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addBoard),
      concatMap(({ board }) => {
        const id = board.name.toLowerCase().replace(/ /g, '-');
        const newBoard: Board = {
          id,
          name: board.name,
          columns: board.columns.map((colName: string) => ({ name: colName, tasks: [] }))
        };
        return this.apiService.createBoard(newBoard).pipe(
          map((savedBoard) => BoardActions.addBoardSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.addBoardFailure({ error: error.message || 'Failed to create board' }))
          )
        );
      })
    )
  );

  updateBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.updateBoard),
      withLatestFrom(this.store.select(selectAllBoards)),
      concatMap(([{ oldName, updatedBoard }, boards]) => {
        const existingBoard = boards.find((b) => b.name === oldName);
        const id = existingBoard?.id || oldName.toLowerCase().replace(/ /g, '-');
        const payload: Board = {
          id,
          name: updatedBoard.name,
          columns: updatedBoard.columns.map((colName: string, index: number) => ({
            name: colName,
            tasks: existingBoard?.columns[index] ? existingBoard.columns[index].tasks : []
          }))
        };
        return this.apiService.updateBoard(id, payload).pipe(
          map((savedBoard) => BoardActions.updateBoardSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.updateBoardFailure({ error: error.message || 'Failed to update board' }))
          )
        );
      })
    )
  );

  deleteBoard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.deleteBoard),
      withLatestFrom(this.store.select(selectAllBoards)),
      concatMap(([{ boardName }, boards]) => {
        const existingBoard = boards.find((b) => b.name === boardName);
        const id = existingBoard?.id || boardName.toLowerCase().replace(/ /g, '-');
        return this.apiService.deleteBoard(id).pipe(
          map(() => BoardActions.deleteBoardSuccess({ boardName })),
          catchError((error) =>
            of(BoardActions.deleteBoardFailure({ error: error.message || 'Failed to delete board' }))
          )
        );
      })
    )
  );

  addTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.addTask),
      withLatestFrom(this.store.select(selectAllBoards)),
      concatMap(([{ boardId, task }, boards]) => {
        const board = boards.find(
          (b) => b.id === boardId || b.name.toLowerCase().replace(/ /g, '-') === boardId
        );
        if (!board || !board.id) {
          return of(BoardActions.addTaskFailure({ error: 'Board not found' }));
        }
        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) =>
            col.name === task.status ? { ...col, tasks: [...col.tasks, task] } : col
          )
        };
        return this.apiService.updateBoard(board.id, updatedBoard).pipe(
          map((savedBoard) => BoardActions.addTaskSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.addTaskFailure({ error: error.message || 'Failed to add task' }))
          )
        );
      })
    )
  );

  updateTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.updateTask),
      withLatestFrom(this.store.select(selectAllBoards)),
      concatMap(([{ boardId, oldTaskTitle, updatedTask }, boards]) => {
        const board = boards.find(
          (b) => b.id === boardId || b.name.toLowerCase().replace(/ /g, '-') === boardId
        );
        if (!board || !board.id) {
          return of(BoardActions.updateTaskFailure({ error: 'Board not found' }));
        }

        const newCols = board.columns.map((col) => {
          const taskIdx = col.tasks.findIndex((t) => t.title === oldTaskTitle);
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

        const finalCols = newCols.map((col) => {
          if (
            col.name === updatedTask.status &&
            !col.tasks.some((t) => t.title === updatedTask.title)
          ) {
            return { ...col, tasks: [...col.tasks, updatedTask] };
          }
          return col;
        });

        const updatedBoard: Board = {
          ...board,
          columns: finalCols
        };

        return this.apiService.updateBoard(board.id, updatedBoard).pipe(
          map((savedBoard) => BoardActions.updateTaskSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.updateTaskFailure({ error: error.message || 'Failed to update task' }))
          )
        );
      })
    )
  );

  deleteTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.deleteTask),
      withLatestFrom(this.store.select(selectCurrentBoard)),
      concatMap(([{ taskTitle, columnStatus }, board]) => {
        if (!board || !board.id) {
          return of(BoardActions.deleteTaskFailure({ error: 'Active board not found' }));
        }

        const updatedBoard: Board = {
          ...board,
          columns: board.columns.map((col) =>
            col.name === columnStatus
              ? { ...col, tasks: col.tasks.filter((t) => t.title !== taskTitle) }
              : col
          )
        };

        return this.apiService.updateBoard(board.id, updatedBoard).pipe(
          map((savedBoard) => BoardActions.deleteTaskSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.deleteTaskFailure({ error: error.message || 'Failed to delete task' }))
          )
        );
      })
    )
  );

  moveTask$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.moveTask),
      withLatestFrom(this.store.select(selectCurrentBoard)),
      concatMap(([_, board]) => {
        if (!board || !board.id) {
          return of(BoardActions.moveTaskFailure({ error: 'Active board not found' }));
        }

        return this.apiService.updateBoard(board.id, board).pipe(
          map((savedBoard) => BoardActions.moveTaskSuccess({ board: savedBoard })),
          catchError((error) =>
            of(BoardActions.moveTaskFailure({ error: error.message || 'Failed to move task' }))
          )
        );
      })
    )
  );

  moveTaskFailure$ = createEffect(() =>
    this.actions$.pipe(
      ofType(BoardActions.moveTaskFailure),
      map(() => BoardActions.loadBoards())
    )
  );
}