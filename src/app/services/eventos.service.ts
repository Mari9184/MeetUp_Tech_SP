import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import {
  Firestore,
  arrayUnion,
  collection,
  collectionData,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import type { Evento } from '../models/evento';

@Injectable({
  providedIn: 'root',
})
export class EventosService {
  private firestore = inject(Firestore);
  private injector = inject(EnvironmentInjector);

  listarEventos(): Observable<Evento[]> {
    return runInInjectionContext(this.injector, () => {
      const ref = collection(this.firestore, 'eventos');
      return collectionData(ref, { idField: 'documentId' }) as Observable<Evento[]>;
    });
  }

  adicionarParticipanteGrupo(eventoId: string, nome: string) {
    const nomeLimpo = nome.trim();
    return runInInjectionContext(this.injector, () => {
      const eventoRef = doc(this.firestore, 'eventos', eventoId);
      return updateDoc(eventoRef, {
        participantes_grupo: arrayUnion(nomeLimpo),
      });
    });
  }
}