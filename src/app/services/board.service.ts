import { Injectable, signal } from '@angular/core';
import data from '../../../public/data.json'; 

@Injectable({ providedIn: 'root' })
export class BoardService {
  // Signal containing the entire data structure
  private boardsSignal = signal(data.boards);
  boards = this.boardsSignal.asReadonly();

  getBoardById(id: string) {
   
    return this.boards().find(b => b.name.toLowerCase().replace(/ /g, '-') === id);
  }

  addTask(boardId: string, task: any) {
  this.boardsSignal.update(boards => {
    return boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        // Find the column that matches the status
        const column = board.columns.find(col => col.name === task.status);
        if (column) {
          column.tasks.push({
            title: task.title,
            description: task.description,
            status: task.status,
            subtasks: task.subtasks.map((s: any) => ({ title: s.name, isCompleted: false }))
          });
        }
      }
      return board;
    });
  });
}


  updateTask(boardId: string, oldTaskTitle: string, updatedTask: any) {
  this.boardsSignal.update(boards => {
    return boards.map(board => {
      if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
        // Find the column the task is currently in
        board.columns.forEach(col => {
          const taskIndex = col.tasks.findIndex(t => t.title === oldTaskTitle);
          
          if (taskIndex !== -1) {
            // Remove from old column if status changed, or just update in place
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
    });
  });
  }

  // Helper to keep code dry
  private formatTask(formValue: any) {
    return {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      subtasks: formValue.subtasks.map((s: any) => ({ title: s.name, isCompleted: false }))
    };
  }


}