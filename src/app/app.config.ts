import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router'; 
import { routes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { boardReducer } from './store/board/board.reducer';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideEffects } from '@ngrx/effects';
import { BoardEffects } from './store/board/board.effects';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideStore({ board: boardReducer }),
    provideStoreDevtools({ maxAge: 25, logOnly: false }),
    provideEffects([BoardEffects]),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor]))
  ]
};