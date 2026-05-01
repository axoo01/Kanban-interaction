import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Simulated logic: In a real app, you'd check an AuthService
  const isLoggedIn = true; 

  if (isLoggedIn) {
    return true;
  } else {
    return router.parseUrl('/boards');
  }
};