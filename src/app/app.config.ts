import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA16bRBdd-yViKgnXjD3-yML2UDtfrOi3A",
  authDomain: "meetuptechsp-6d003.firebaseapp.com",
  projectId: "meetuptechsp-6d003",
  storageBucket: "meetuptechsp-6d003.firebasestorage.app",
  messagingSenderId: "350029597582",
  appId: "1:350029597582:web:15b531653e441862fb72df"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore())
  ]
};