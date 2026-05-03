import { Injectable, signal, computed } from '@angular/core';
import data from '../../../public/data.json'; 

@Injectable({ providedIn: 'root' })
export class BoardService {
  private boardsSignal = signal(data.boards);
  boards = this.boardsSignal.asReadonly();

  // Track the ID of the board currently being viewed
  activeBoardId = signal<string>('');

  setActiveBoard(id: string) {
    this.activeBoardId.set(id);
  }

  getCurrentBoard() {
    const id = this.activeBoardId();
    return this.getBoardById(id);
  }

  getBoardById(id: string) {
    return this.boards().find(b => b.name.toLowerCase().replace(/ /g, '-') === id);
  }

  addTask(boardId: string, task: any) {
    this.boardsSignal.update(boards => {
      return boards.map(board => {
        if (board.name.toLowerCase().replace(/ /g, '-') === boardId) {
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
      });
    });
  }

  private formatTask(formValue: any) {
    return {
      title: formValue.title,
      description: formValue.description,
      status: formValue.status,
      subtasks: formValue.subtasks.map((s: any) => ({ title: s.name, isCompleted: false }))
    };
  }

  addBoard(boardData: any) {
  this.boardsSignal.update(boards => {
    const newBoard = {
      name: boardData.name,
      columns: boardData.columns.map((colName: string) => ({
        name: colName,
        tasks: []
      }))
    };
    const updatedBoards = [...boards, newBoard];
    console.log('BOARD SERVICE: New Board Added. Total boards:', updatedBoards.length);
    return updatedBoards;
  });
}

  updateBoard(oldName: string, updatedBoard: any) {
    this.boardsSignal.update(boards => boards.map(board => {
      if (board.name === oldName) {
        return {
          ...board,
          name: updatedBoard.name,
          // Map new column names while preserving existing tasks if the index matches
          columns: updatedBoard.columns.map((colName: string, index: number) => {
            const existingCol = board.columns[index];
            return {
              name: colName,
              tasks: existingCol ? existingCol.tasks : [] 
            };
          })
        };
      }
      return board;
    }));
  }
  deleteBoard(boardName: string) {
    this.boardsSignal.update(boards => 
      boards.filter(b => b.name !== boardName)
    );
  }

  deleteTask(taskTitle: string, columnStatus: string) {
  this.boardsSignal.update(boards => boards.map(board => {
    // Only update the columns for the board currently being viewed
    return {
      ...board,
      columns: board.columns.map(col => {
        if (col.name === columnStatus) {
          // Filter out the task by title
          return {
            ...col,
            tasks: col.tasks.filter(t => t.title !== taskTitle)
          };
        }
        return col;
      })
    };
  }));
}
}