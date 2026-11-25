import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
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
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
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
    const credencial = await runInInjectionContext(this.injector, () =>
      createUserWithEmailAndPassword(this.auth, email.trim(), senha),
    );
    const uid = credencial.user.uid;

    await runInInjectionContext(this.injector, () =>
      setDoc(doc(this.firestore, `administradores/${uid}`), {
        nome: nome.trim(),
        sobrenome: sobrenome.trim(),
        email: email.trim(),
        data_registro: serverTimestamp(),
      }),
    );

    return credencial.user;
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