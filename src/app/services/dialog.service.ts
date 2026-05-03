import { Injectable, signal, Type } from '@angular/core';

export type DialogType = 'task' | 'board';
export type DialogMode = 'add' | 'edit';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private dialogState = signal<{ isOpen: boolean; type: DialogType; mode: DialogMode; data?: any }>({
    isOpen: false,
    type: 'task',
    mode: 'add',
  });

  state = this.dialogState.asReadonly();

  openBoardModal(mode: DialogMode, data?: any) {
  console.log('SERVICE: Opening Board Modal', { mode, data });
  this.dialogState.set({ isOpen: true, type: 'board', mode, data });
}

openTaskModal(mode: DialogMode, data?: any) {
  console.log('SERVICE: Opening Task Modal', { mode, data });
  this.dialogState.set({ isOpen: true, type: 'task', mode, data });
}

  close() {
    this.dialogState.update(val => ({ ...val, isOpen: false }));
  }
}