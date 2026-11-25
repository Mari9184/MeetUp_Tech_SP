import {
  Component,
  DestroyRef,
  EnvironmentInjector,
  computed,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Firestore, collection, collectionData, doc, docData } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs';
import type { Evento } from '../../models/evento';
import { EventosService } from '../../services/eventos.service';
import { AdicionarNome } from '../../componentes/adicionar-nome/adicionar-nome';

export interface DetalheEventoView {
  id: string;
  titulo: string;
  descricao: string;
  dataExtenso: string;
  horarioResumo: string;
  fichaDataHorario: string;
  local: string;
  cidadeResumo: string;
  estacao: string;
  areaTech: string;
  empresa: string;
  formato: string;
  linkInscricao: string;
  participantes: string[];
  categorias: string[];
}

@Component({
  imports: [RouterLink, AdicionarNome],
  selector: 'app-pagina-evento',
  styleUrl: './pagina-evento.css',
  templateUrl: './pagina-evento.html',
})
export class PaginaEvento {
  private route = inject(ActivatedRoute);
  private firestore = inject(Firestore);
  private eventosService = inject(EventosService);
  private injector = inject(EnvironmentInjector);
  private sanitizer = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);

  carregando = signal(true);
  erro = signal('');
  erroParticipacao = signal('');
  evento = signal<DetalheEventoView | null>(null);
  modalAberto = signal(false);
  salvandoParticipante = signal(false);

  urlMapaEmbed = computed<SafeResourceUrl>(() => {
    const local = this.evento()?.local || 'Av. Paulista, 1000, São Paulo';
    const query = encodeURIComponent(local.includes('São Paulo') ? local : `${local}, São Paulo`);
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.google.com/maps?q=${query}&output=embed`,
    );
  });

  urlMapaExterno = computed<string>(() => {
    const local = this.evento()?.local || 'Av. Paulista, 1000, São Paulo';
    const query = encodeURIComponent(local.includes('São Paulo') ? local : `${local}, São Paulo`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  });

  constructor() {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id') || this.route.snapshot.queryParamMap.get('id') || '';
          return runInInjectionContext(this.injector, () => {
            if (id) {
              const ref = doc(this.firestore, 'eventos', id);
              return docData(ref, { idField: 'documentId' });
            }
            const colRef = collection(this.firestore, 'eventos');
            return collectionData(colRef, { idField: 'documentId' }).pipe(
              map((lista) => (lista && lista.length > 0 ? lista[0] : null)),
            );
          });
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (dado) => {
          if (!dado) {
            this.evento.set(null);
            this.erro.set('Evento não encontrado.');
          } else {
            this.evento.set(this.mapearEvento(dado as Evento));
            this.erro.set('');
          }
          this.carregando.set(false);
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar detalhes do evento:', err);
          this.evento.set(null);
          this.erro.set('Não foi possível carregar os detalhes deste evento.');
          this.carregando.set(false);
        },
      });
  }

  abrirModalParticipacao() {
    this.erroParticipacao.set('');
    this.modalAberto.set(true);
  }

  fecharModalParticipacao() {
    if (!this.salvandoParticipante()) {
      this.modalAberto.set(false);
    }
  }

  async aoConfirmarParticipacao(nome: string) {
    const ev = this.evento();
    if (!ev?.id) {
      this.erroParticipacao.set('Não foi possível identificar o evento para salvar seu nome.');
      return;
    }

    this.salvandoParticipante.set(true);
    this.erroParticipacao.set('');

    try {
      await this.eventosService.adicionarParticipanteGrupo(ev.id, nome);
      this.modalAberto.set(false);
    } catch (err: unknown) {
      console.error('Erro ao adicionar participante:', err);
      this.erroParticipacao.set('Não foi possível adicionar seu nome agora. Tente novamente.');
    } finally {
      this.salvandoParticipante.set(false);
    }
  }

  private mapearEvento(dado: Evento): DetalheEventoView {
    const raw = dado as unknown as Record<string, unknown>;
    const titulo = this.texto(raw['titulo']) || 'Evento sem título';
    const data = this.converterData(raw['data_evento'] ?? raw['data']);
    const horario = this.texto(raw['horario']);
    const local = this.texto(raw['localizacao'] ?? raw['local']) || 'Local a confirmar';
    const estacao = this.texto(raw['estacao_metro'] ?? raw['estacao']) || 'Não informada';
    const empresa = this.texto(raw['empresa_comunidade'] ?? raw['empresa']) || 'Comunidade Tech SP';
    const formato = this.texto(raw['formato']) || 'Presencial';
    const tema = this.texto(raw['tema'] ?? raw['area']);
    const tags = this.textos(raw['tags']);
    const publico = this.textos(raw['publico_alvo']);
    const linkInscricao = this.texto(raw['link']);
    const participantes = this.textos(raw['participantes_grupo']).filter((p) => p.length > 0);

    const dataExtenso = data
      ? new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(data)
      : 'Data a definir';

    const diaSemana = data
      ? new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(data).replace('.', '')
      : '';
    const mesCurto = data
      ? new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(data).replace('.', '')
      : '';
    const diaNum = data ? String(data.getDate()).padStart(2, '0') : '--';
    const anoNum = data ? data.getFullYear() : '';

    const fichaDataHorario = data
      ? `${diaSemana ? `${diaSemana}, ` : ''}${diaNum} ${mesCurto} ${anoNum}${horario ? ` · ${horario}` : ''}`
      : horario || 'A definir';

    const areaTech = [tema, tags[0]].filter(Boolean).join(' · ') || 'Tecnologia';
    const categorias = [formato, ...publico.slice(0, 2), 'Gratuito'].filter(
      (item, idx, arr) => Boolean(item) && arr.indexOf(item) === idx,
    );

    const descricao =
      this.texto(raw['descricao']) ||
      `Encontro promovido por ${empresa} em formato ${formato.toLowerCase()}, reunindo a comunidade tech de São Paulo.`;

    return {
      id: this.texto(raw['documentId']) || '',
      titulo,
      descricao,
      dataExtenso,
      horarioResumo: horario ? `${horario}` : 'Horário a confirmar',
      fichaDataHorario,
      local,
      cidadeResumo: local.toLowerCase().includes('são paulo') ? local : `${local} · São Paulo`,
      estacao,
      areaTech,
      empresa,
      formato,
      linkInscricao,
      participantes,
      categorias,
    };
  }

  private converterData(valor: unknown): Date | null {
    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? null : valor;
    }
    if (typeof valor === 'string') {
      const limpo = valor.trim();
      const iso = limpo.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (iso) {
        return new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]));
      }
      const d = new Date(limpo);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (valor && typeof valor === 'object' && 'toDate' in valor && typeof valor.toDate === 'function') {
      const d = valor.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    }
    return null;
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }

  private textos(valor: unknown): string[] {
    return Array.isArray(valor)
      ? valor.filter((item): item is string => typeof item === 'string').map((item) => item.trim())
      : [];
  }
}