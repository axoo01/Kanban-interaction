import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

export type DialogType = 'task' | 'board' | 'delete' | 'view';
export type DialogMode = 'add' | 'edit';

@Injectable({ providedIn: 'root' })
export class DialogService {
  private router = inject(Router);

  private dialogState = signal<{ isOpen: boolean; type: DialogType; mode: DialogMode; data?: any }>({
    isOpen: false,
    type: 'task',
    mode: 'add',
  });

  state = this.dialogState.asReadonly();
  isFormDirty = signal(false);

  setFormDirty(dirty: boolean) {
    this.isFormDirty.set(dirty);
  }

  openBoardModal(mode: DialogMode, data?: any) {
    this.isFormDirty.set(false);
    this.router.navigate([], {
      queryParams: { modal: `${mode}-board` },
      queryParamsHandling: 'merge'
    });
  }

  openTaskModal(mode: DialogMode, data?: any) {
    this.isFormDirty.set(false);
    const queryParams: any = { modal: `${mode}-task` };
    if (data && data.title) {
      queryParams['task'] = data.title;
    }
    this.router.navigate([], {
      queryParams,
      queryParamsHandling: 'merge'
    });
  }

  openViewTaskModal(task: any) {
    this.isFormDirty.set(false);
    this.router.navigate([], {
      queryParams: { modal: 'view-task', task: task.title },
      queryParamsHandling: 'merge'
    });
  }

  openDeleteModal(data: { title: string; message: string; onConfirm: () => void }) {
    this.isFormDirty.set(false);
    this.dialogState.set({ 
      isOpen: true, 
      type: 'delete', 
      mode: 'edit', 
      data 
    });
  }

  close() {
    if (this.isFormDirty()) {
      const confirm = window.confirm('You have unsaved changes. Do you really want to discard them?');
      if (!confirm) return;
    }
    this.isFormDirty.set(false);
    this.router.navigate([], {
      queryParams: { modal: null, task: null },
      queryParamsHandling: 'merge'
    });
  }

  setRawState(state: { isOpen: boolean; type: DialogType; mode: DialogMode; data?: any }) {
    this.dialogState.set(state);
  }
}