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
}