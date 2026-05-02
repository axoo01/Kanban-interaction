import { Injectable, signal, Type } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DialogService {
  // holds the state of the dialog and any data needed (like a task object)
  private dialogState = signal<{ isOpen: boolean; mode: 'add' | 'edit'; data?: any }>({
    isOpen: false,
    mode: 'add',
  });

  // Readonly view for components
  state = this.dialogState.asReadonly();

  openAddMode() {
    this.dialogState.set({ isOpen: true, mode: 'add' });
  }

  openEditMode(taskData: any) {
    this.dialogState.set({ isOpen: true, mode: 'edit', data: taskData });
  }

  close() {
    this.dialogState.update(val => ({ ...val, isOpen: false }));
  }
}