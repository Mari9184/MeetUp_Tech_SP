import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { getAnalytics, provideAnalytics } from '@angular/fire/analytics';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { routes } from './app.routes';

const firebaseConfig = {
  // Confira se cada caractere (especialmente 0 vs. O) bate exatamente com a chave no Google Cloud
  apiKey: 'AIzaSyA74OpFoiwO5gas4_cD4_gfqOg0-ZJ8XHc',
  authDomain: 'meetuptechsp-76298.firebaseapp.com',
  projectId: 'meetuptechsp-76298',
  storageBucket: 'meetuptechsp-76298.firebasestorage.app',
  messagingSenderId: '146826759932',
  appId: '1:146826759932:web:f7169b69d28ef20c02d179',
  measurementId: 'G-F6TE85Q59Z',
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnalytics(() => getAnalytics()),
  ],
};