import { CanDeactivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { DialogService } from '../services/dialog.service';

export const unsavedChangesGuard: CanDeactivateFn<any> = () => {
  const dialogService = inject(DialogService);

  if (dialogService.isFormDirty()) {
    const leave = window.confirm('You have unsaved changes. Do you really want to leave?');
    if (leave) {
      dialogService.setFormDirty(false);
      dialogService.close();
      return true;
    }
    return false;
  }
  return true;
};