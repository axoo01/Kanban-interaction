import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Board, Task } from '../../models/board.model';

export const BoardActions = createActionGroup({
  source: 'Board',
  events: {
    // 1. Initial Load
    'Load Boards': emptyProps(),
    
    // 2. Navigation / Selection
    'Select Board': props<{ boardId: string }>(),
    
    // 3. Board CRUD
    'Add Board': props<{ board: any }>(),
    'Update Board': props<{ oldName: string; updatedBoard: any }>(),
    'Delete Board': props<{ boardName: string }>(),
    
    // 4. Task CRUD
    'Add Task': props<{ boardId: string; task: any }>(),
    'Update Task': props<{ boardId: string; oldTaskTitle: string; updatedTask: any }>(),
    'Delete Task': props<{ taskTitle: string; columnStatus: string }>(),
    'Move Task': props<{ task: Task; oldStatus: string; newStatus: string }>()
  }
});