import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
 
  darkMode = signal<boolean>(localStorage.getItem('theme') === 'dark');

  constructor() {
   
    effect(() => {
      const mode = this.darkMode() ? 'dark' : 'light';
      localStorage.setItem('theme', mode);
      
      if (this.darkMode()) {
        document.body.classList.add('dark-theme');
      } else {
        document.body.classList.remove('dark-theme');
      }
    });
  }

  toggleTheme() {
    this.darkMode.update(val => !val);
  }
}