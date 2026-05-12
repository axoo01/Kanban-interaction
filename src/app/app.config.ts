import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router'; 
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { boardReducer } from './store/board/board.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ board: boardReducer }),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()) 
  ]
};