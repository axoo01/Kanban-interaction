import { CanDeactivateFn } from '@angular/router';

export const unsavedChangesGuard: CanDeactivateFn<any> = (component) => {
  // Logic: If the component has a specific flag, ask for confirmation
  // For now, we'll use a simple window confirm
  const hasUnsavedChanges = false; // Usually linked to a form.dirty state

  if (hasUnsavedChanges) {
    return window.confirm('You have unsaved changes. Do you really want to leave?');
  }
  return true;
};