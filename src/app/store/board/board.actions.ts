import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Board, Task } from '../../models/board.model';

export const BoardActions = createActionGroup({
  source: 'Board',
  events: {
    // 1. Initial Load
    'Load Boards': emptyProps(),
    'Load Boards Success': props<{ boards: Board[] }>(), 
    'Load Boards Failure': props<{ error: string }>(),
    
    // 2. Navigation / Selection
    'Select Board': props<{ boardId: string }>(),
    
    // 3. Board CRUD
    'Add Board': props<{ board: any }>(),
    'Add Board Success': props<{ board: Board }>(),
    'Add Board Failure': props<{ error: string }>(),

    'Update Board': props<{ oldName: string; updatedBoard: any }>(),
    'Update Board Success': props<{ board: Board }>(),
    'Update Board Failure': props<{ error: string }>(),

    'Delete Board': props<{ boardName: string }>(),
    'Delete Board Success': props<{ boardName: string }>(),
    'Delete Board Failure': props<{ error: string }>(),
    
    // 4. Task CRUD
    'Add Task': props<{ boardId: string; task: any }>(),
    'Add Task Success': props<{ board: Board }>(),
    'Add Task Failure': props<{ error: string }>(),

    'Update Task': props<{ boardId: string; oldTaskTitle: string; updatedTask: any }>(),
    'Update Task Success': props<{ board: Board }>(),
    'Update Task Failure': props<{ error: string }>(),

    'Delete Task': props<{ taskTitle: string; columnStatus: string }>(),
    'Delete Task Success': props<{ board: Board }>(),
    'Delete Task Failure': props<{ error: string }>(),

    'Move Task': props<{ task: Task; oldStatus: string; newStatus: string }>(),
    'Move Task Success': props<{ board: Board }>(),
    'Move Task Failure': props<{ error: string }>()
  }
});