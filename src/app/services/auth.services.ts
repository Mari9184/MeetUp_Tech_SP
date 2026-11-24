import { Injectable, inject } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  authState
} from '@angular/fire/auth';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  user$ = authState(this.auth);

  async cadastrarAdministrador(nome: string, sobrenome: string, email: string, senha: string) {
    const credencial = await createUserWithEmailAndPassword(this.auth, email, senha);
    const uid = credencial.user.uid;

    await setDoc(doc(this.firestore, `administradores/${uid}`), {
      nome,
      sobrenome,
      email,
      data_registro: serverTimestamp()
    });

    return credencial.user;
  }

  login(email: string, senha: string) {
    return signInWithEmailAndPassword(this.auth, email, senha);
  }

  logout() {
    return signOut(this.auth);
  }

  getAdminUid(): string | null {
    return this.auth.currentUser ? this.auth.currentUser.uid : null;
  }

  listarAdministradores() {
    return collectionData(collection(this.firestore, 'administradores'), { idField: 'uid' });
  }

  editarAdministrador(uid: string, dados: { nome?: string; sobrenome?: string; email?: string }) {
    return updateDoc(doc(this.firestore, `administradores/${uid}`), dados);
  }

  excluirAdministrador(uid: string) {
    return deleteDoc(doc(this.firestore, `administradores/${uid}`));
  }
}