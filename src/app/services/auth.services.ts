import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  authState,
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { deleteApp, getApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword as createAuthUserWithEmailAndPassword,
  getAuth,
  inMemoryPersistence,
  setPersistence,
  signOut as signOutSecondaryAuth,
} from 'firebase/auth';
import { map, Observable } from 'rxjs';
import type { Administrador } from '../models/administrador';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  user$ = authState(this.auth);

  async cadastrarAdministrador(nome: string, sobrenome: string, email: string, senha: string) {
    const nomeLimpo = nome.trim();
    const sobrenomeLimpo = sobrenome.trim();
    const emailLimpo = email.trim();

    const appPrincipal = getApp();
    const nomeAppSecundario = `admin-cadastro-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const appSecundario = initializeApp(appPrincipal.options, nomeAppSecundario);
    const authSecundario = getAuth(appSecundario);

    try {
      await setPersistence(authSecundario, inMemoryPersistence);
      const credencial = await createAuthUserWithEmailAndPassword(
        authSecundario,
        emailLimpo,
        senha,
      );
      const novoUsuario = credencial.user;
      const uid = novoUsuario.uid;

      const dadosAdmin: Record<string, unknown> = {
        uid,
        nome: nomeLimpo,
        email: emailLimpo,
        data_registro: serverTimestamp(),
      };

      if (sobrenomeLimpo) {
        dadosAdmin['sobrenome'] = sobrenomeLimpo;
      }

      await runInInjectionContext(this.injector, () =>
        setDoc(doc(this.firestore, `administradores/${uid}`), dadosAdmin),
      );

      await signOutSecondaryAuth(authSecundario).catch(() => undefined);

      return novoUsuario;
    } finally {
      await deleteApp(appSecundario).catch(() => undefined);
    }
  }

  login(email: string, senha: string) {
    return runInInjectionContext(this.injector, () =>
      signInWithEmailAndPassword(this.auth, email.trim(), senha),
    );
  }

  logout() {
    return runInInjectionContext(this.injector, () => signOut(this.auth));
  }

  getAdminUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  obterPerfilAdministrador(uid: string): Observable<Administrador | null> {
    return runInInjectionContext(this.injector, () =>
      docData(doc(this.firestore, `administradores/${uid}`)),
    ).pipe(
      map((administrador): Administrador | null => {
        if (!administrador) {
          return null;
        }

        const dados = administrador as Record<string, unknown>;
        return {
          uid,
          nome: typeof dados['nome'] === 'string' ? dados['nome'] : '',
          sobrenome: typeof dados['sobrenome'] === 'string' ? dados['sobrenome'] : undefined,
          email: typeof dados['email'] === 'string' ? dados['email'] : '',
        };
      }),
    );
  }

  listarAdministradores(): Observable<Administrador[]> {
    return runInInjectionContext(this.injector, () => {
      return collectionData(collection(this.firestore, 'administradores'), {
        idField: 'uid',
      }) as Observable<Administrador[]>;
    });
  }

  editarAdministrador(uid: string, dados: { nome?: string; sobrenome?: string; email?: string }) {
    return runInInjectionContext(this.injector, () =>
      updateDoc(doc(this.firestore, `administradores/${uid}`), dados),
    );
  }

  excluirAdministrador(uid: string) {
    return runInInjectionContext(this.injector, () =>
      deleteDoc(doc(this.firestore, `administradores/${uid}`)),
    );
  }

  recuperarSenha(email: string) {
    const emailLimpo = email.trim();
    return runInInjectionContext(this.injector, () =>
      sendPasswordResetEmail(this.auth, emailLimpo),
    );
  }
}