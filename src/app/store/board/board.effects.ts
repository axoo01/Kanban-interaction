import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { BoardActions } from './board.actions';
import { Store } from '@ngrx/store';
import { map, of, catchError, concatMap, switchMap, withLatestFrom, forkJoin } from 'rxjs';
import { selectAllBoards, selectCurrentBoard } from './board.selectors';
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
        const columnsData = (board.columns || []).map((c: any) =>
          typeof c === 'string' ? { name: c } : { name: c.name }
        );
        return this.apiService.createBoard({ name: board.name, columns: columnsData }).pipe(
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
        const existingBoard = boards.find(
          (b) => b.name === oldName || b.id === oldName || b.name.toLowerCase().replace(/ /g, '-') === oldName
        );
        if (!existingBoard || !existingBoard.id) {
          return of(BoardActions.updateBoardFailure({ error: 'Board not found' }));
        }

        const newColumnNames: string[] = (updatedBoard.columns || []).map((c: any) =>
          typeof c === 'string' ? c : c.name
        );
        const existingColumnNames = existingBoard.columns.map((c) => c.name);

        const columnsToAdd = newColumnNames.filter((name) => !existingColumnNames.includes(name));

        const updateName$ =
          existingBoard.name !== updatedBoard.name
            ? this.apiService.updateBoard(existingBoard.id, { name: updatedBoard.name })
            : of(null);

        const addColumns$ =
          columnsToAdd.length > 0
            ? forkJoin(columnsToAdd.map((name) => this.apiService.createColumn(existingBoard.id!, name)))
            : of([]);

        return forkJoin([updateName$, addColumns$]).pipe(
          switchMap(() => this.apiService.getBoardById(existingBoard.id!)),
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
        const existingBoard = boards.find(
          (b) => b.name === boardName || b.id === boardName || b.name.toLowerCase().replace(/ /g, '-') === boardName
        );
        if (!existingBoard || !existingBoard.id) {
          return of(BoardActions.deleteBoardSuccess({ boardName }));
        }
        return this.apiService.deleteBoard(existingBoard.id).pipe(
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

        const column = board.columns.find((c) => c.name === task.status);
        if (!column || !(column as any).id) {
          return of(BoardActions.addTaskFailure({ error: `Column '${task.status}' not found` }));
        }

        const taskData = {
          columnId: (column as any).id,
          title: task.title,
          description: task.description,
          subtasks: task.subtasks
        };

        return this.apiService.createTask(taskData).pipe(
          switchMap(() => this.apiService.getBoardById(board.id!)),
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

        let existingTask: any = null;
        for (const col of board.columns) {
          const t = col.tasks.find((tk: any) => tk.title === oldTaskTitle || tk.id === updatedTask.id);
          if (t) {
            existingTask = t;
            break;
          }
        }

        if (!existingTask || !existingTask.id) {
          return of(BoardActions.updateTaskFailure({ error: 'Task not found in board' }));
        }

        const updateData = {
          title: updatedTask.title,
          description: updatedTask.description,
          status: updatedTask.status,
          subtasks: updatedTask.subtasks
        };

        return this.apiService.updateTask(existingTask.id, updateData).pipe(
          switchMap(() => this.apiService.getBoardById(board.id!)),
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

        const col = board.columns.find((c) => c.name === columnStatus);
        const task: any = col?.tasks.find((t) => t.title === taskTitle);

        if (!task || !task.id) {
          return of(BoardActions.deleteTaskFailure({ error: 'Task not found' }));
        }

        return this.apiService.deleteTask(task.id).pipe(
          switchMap(() => this.apiService.getBoardById(board.id!)),
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
      concatMap(([{ previousColumnName, currentColumnName, previousIndex, currentIndex }, board]) => {
        if (!board || !board.id) {
          return of(BoardActions.moveTaskFailure({ error: 'Active board not found' }));
        }

        const prevCol: any = board.columns.find((c: any) => c.name === previousColumnName);
        const targetCol: any = board.columns.find((c: any) => c.name === currentColumnName);
        const task: any = prevCol?.tasks[previousIndex];

        if (!task || !task.id || !targetCol || !targetCol.id) {
          return of(BoardActions.moveTaskFailure({ error: 'Task or target column missing database ID' }));
        }

        return this.apiService.moveTask(task.id, targetCol.id, currentIndex).pipe(
          switchMap(() => this.apiService.getBoardById(board.id!)),
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