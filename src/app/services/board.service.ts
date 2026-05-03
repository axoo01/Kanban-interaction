import { Injectable, signal, computed } from '@angular/core';
import data from '../../../public/data.json'; 

@Injectable({ providedIn: 'root' })
export class BoardService {
  private boardsSignal = signal(data.boards);
  boards = this.boardsSignal.asReadonly();

  // 1. TRACK ACTIVE BOARD
  activeBoardId = signal<string>('');

  // 2. THE REACTIVE SOURCE (Important for your dropdowns!)
  currentBoard = computed(() => {
    const id = this.activeBoardId();
    return this.boardsSignal().find(
      b => b.name.toLowerCase().replace(/ /g, '-') === id
    );
  });

  setActiveBoard(id: string) {
    this.activeBoardId.set(id);
  }

  getBoardById(id: string) {
    return this.boards().find(b => b.name.toLowerCase().replace(/ /g, '-') === id);
  }

  // --- RESTORED TASK ACTIONS ---

  addTask(boardId: string, task: any) {
    this.boardsSignal.update(boards => boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        const column = board.columns.find(col => col.name === task.status);
        if (column) {
          column.tasks.push({
            title: task.title,
            description: task.description,
            status: task.status,
            subtasks: task.subtasks.map((s: any) => ({ 
              title: s.name || s, 
              isCompleted: false 
            }))
          });
        }
      }
      return board;
    }));
  }

  updateTask(boardId: string, oldTaskTitle: string, updatedTask: any) {
    this.boardsSignal.update(boards => boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        board.columns.forEach(col => {
          const taskIndex = col.tasks.findIndex(t => t.title === oldTaskTitle);
          if (taskIndex !== -1) {
            if (col.name !== updatedTask.status) {
              col.tasks.splice(taskIndex, 1);
              const newCol = board.columns.find(c => c.name === updatedTask.status);
              newCol?.tasks.push(this.formatTask(updatedTask));
            } else {
              col.tasks[taskIndex] = this.formatTask(updatedTask);
            }
          }
        });
      }
      return board;
    }));
  }

  private formatTask(formValue: any) {
    return {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      subtasks: formValue.subtasks.map((s: any) => ({ 
        title: s.name || s.title || s, 
        isCompleted: s.isCompleted || false 
      }))
    };
  }

  // --- RESTORED BOARD ACTIONS ---

  addBoard(boardData: any) {
    this.boardsSignal.update(boards => [
      ...boards, 
      {
        name: boardData.name,
        columns: boardData.columns.map((colName: string) => ({ name: colName, tasks: [] }))
      }
    ]);
  }

  updateBoard(oldName: string, updatedBoard: any) {
    this.boardsSignal.update(boards => boards.map(board => {
      if (board.name === oldName) {
        return {
          ...board,
          name: updatedBoard.name,
          columns: updatedBoard.columns.map((colName: string, index: number) => {
            const existingCol = board.columns[index];
            return { name: colName, tasks: existingCol ? existingCol.tasks : [] };
          })
        };
      }
      return board;
    }));
  }

  deleteBoard(boardName: string) {
    this.boardsSignal.update(boards => boards.filter(b => b.name !== boardName));
  }

  deleteTask(taskTitle: string, columnStatus: string) {
    this.boardsSignal.update(boards => boards.map(board => ({
      ...board,
      columns: board.columns.map(col => col.name === columnStatus 
        ? { ...col, tasks: col.tasks.filter(t => t.title !== taskTitle) } 
        : col
      )
    })));
  }

  moveTask(task: any, oldStatus: string, newStatus: string) {
    this.boardsSignal.update(boards => boards.map(board => ({
      ...board,
      columns: board.columns.map(col => {
        if (col.name === oldStatus) return { ...col, tasks: col.tasks.filter(t => t.title !== task.title) };
        if (col.name === newStatus) return { ...col, tasks: [...col.tasks, { ...task, status: newStatus }] };
        return col;
      })
    })));
  }
}