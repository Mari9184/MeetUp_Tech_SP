import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { MenuLateral } from '../../componentes/menu-lateral/menu-lateral';
import { ExcluirAdministrador } from '../../componentes/excluir-administrador/excluir-administrador';
import { EventosService } from '../../services/eventos.service';
import type { Evento } from '../../models/evento';

export type StatusFiltroEvento =
  | 'todos'
  | 'publicado'
  | 'rascunho'
  | 'cancelado'
  | 'encerrado';

export interface EventoTabelaView {
  id: string;
  titulo: string;
  subtitulo: string;
  dataFormatada: string;
  dataObj: Date | null;
  formato: string;
  vagasTexto: string;
  vagasLimitadas: boolean;
  statusNormalizado: 'publicado' | 'rascunho' | 'cancelado' | 'encerrado';
  statusRotulo: string;
  participantesCount: number;
  inativo: boolean;
}

@Component({
  imports: [MenuLateral, RouterLink, ExcluirAdministrador],
  selector: 'app-pagina-eventos-adm',
  styleUrl: './pagina-eventos-adm.css',
  templateUrl: './pagina-eventos-adm.html',
})
export class PaginaEventosAdm {
  private eventosService = inject(EventosService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly itensPorPagina = 6;

  carregando = signal(true);
  erro = signal('');
  acaoEmAndamentoId = signal<string | null>(null);
  eventos = signal<EventoTabelaView[]>([]);
  filtroStatus = signal<StatusFiltroEvento>('todos');
  termoBusca = signal('');
  paginaAtual = signal(1);

  // Estado do modal de exclusão (reutilizando ExcluirAdministrador)
  eventoParaExcluir = signal<EventoTabelaView | null>(null);
  excluindoEvento = signal(false);
  erroExclusaoModal = signal('');

  contadores = computed(() => {
    const lista = this.eventos();
    const agora = new Date();
    const limite30Dias = new Date(agora.getTime() + 30 * 24 * 60 * 60 * 1000);

    let publicados = 0;
    let rascunhos = 0;
    let cancelados = 0;
    let encerrados = 0;
    let proximos30Dias = 0;
    let vagasLimitadasProximos = 0;
    let totalParticipantes = 0;

    for (const ev of lista) {
      totalParticipantes += ev.participantesCount;

      if (ev.statusNormalizado === 'publicado') publicados++;
      else if (ev.statusNormalizado === 'rascunho') rascunhos++;
      else if (ev.statusNormalizado === 'cancelado') cancelados++;
      else if (ev.statusNormalizado === 'encerrado') encerrados++;

      if (
        ev.statusNormalizado !== 'cancelado' &&
        ev.statusNormalizado !== 'encerrado' &&
        ev.dataObj &&
        ev.dataObj >= agora &&
        ev.dataObj <= limite30Dias
      ) {
        proximos30Dias++;
        if (ev.vagasLimitadas) {
          vagasLimitadasProximos++;
        }
      }
    }

    return {
      todos: lista.length,
      publicados,
      rascunhos,
      cancelados,
      encerrados,
      proximos30Dias,
      vagasLimitadasProximos,
      totalParticipantes,
    };
  });

  eventosFiltrados = computed(() => {
    const status = this.filtroStatus();
    const busca = this.termoBusca().trim().toLowerCase();

    return this.eventos().filter((ev) => {
      const bateStatus = status === 'todos' || ev.statusNormalizado === status;
      if (!bateStatus) return false;

      if (!busca) return true;
      return (
        ev.titulo.toLowerCase().includes(busca) ||
        ev.subtitulo.toLowerCase().includes(busca) ||
        ev.formato.toLowerCase().includes(busca)
      );
    });
  });

  totalPaginas = computed(() => {
    const total = this.eventosFiltrados().length;
    return Math.max(1, Math.ceil(total / this.itensPorPagina));
  });

  paginas = computed(() => {
    const total = this.totalPaginas();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  eventosPaginados = computed(() => {
    const lista = this.eventosFiltrados();
    const pagina = Math.min(this.paginaAtual(), this.totalPaginas());
    const inicio = (pagina - 1) * this.itensPorPagina;
    return lista.slice(inicio, inicio + this.itensPorPagina);
  });

  constructor() {
    this.eventosService
      .listarEventos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          const mapeados = (lista ?? []).map((item) => this.mapearEvento(item));
          this.eventos.set(mapeados);
          this.erro.set('');
          this.carregando.set(false);
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar eventos no painel administrativo:', err);
          this.eventos.set([]);
          this.erro.set('Não foi possível carregar os eventos do banco.');
          this.carregando.set(false);
        },
      });
  }

  selecionarFiltro(status: StatusFiltroEvento, event?: Event) {
    event?.preventDefault();
    this.filtroStatus.set(status);
    this.paginaAtual.set(1);
  }

  atualizarBusca(valor: string) {
    this.termoBusca.set(valor);
    this.paginaAtual.set(1);
  }

  irParaPagina(pagina: number, event?: Event) {
    event?.preventDefault();
    if (pagina >= 1 && pagina <= this.totalPaginas()) {
      this.paginaAtual.set(pagina);
    }
  }

  visualizarEvento(id: string) {
    if (!id) return;
    this.router.navigate(['/evento', id]);
  }

  editarEvento(id: string) {
    if (!id) return;
    this.router.navigate(['/eventos/editar', id]);
  }

  async alternarCancelamento(ev: EventoTabelaView) {
    if (!ev.id || this.acaoEmAndamentoId()) return;

    const novoStatus = ev.statusNormalizado === 'cancelado' ? 'Publicado' : 'Cancelado';
    this.acaoEmAndamentoId.set(ev.id);
    this.erro.set('');

    try {
      await this.eventosService.atualizarEvento(ev.id, { status: novoStatus });
    } catch (err: unknown) {
      console.error('Erro ao atualizar status do evento:', err);
      this.erro.set('Não foi possível alterar o status do evento.');
    } finally {
      this.acaoEmAndamentoId.set(null);
    }
  }

  solicitarExclusaoEvento(ev: EventoTabelaView) {
    if (!ev.id || this.excluindoEvento() || this.acaoEmAndamentoId()) return;
    this.erroExclusaoModal.set('');
    this.eventoParaExcluir.set(ev);
  }

  cancelarExclusaoEvento() {
    if (this.excluindoEvento()) return;
    this.eventoParaExcluir.set(null);
    this.erroExclusaoModal.set('');
  }

  async confirmarExclusaoEvento() {
    const ev = this.eventoParaExcluir();
    if (!ev?.id || this.excluindoEvento()) return;

    this.excluindoEvento.set(true);
    this.erroExclusaoModal.set('');
    this.acaoEmAndamentoId.set(ev.id);

    try {
      await this.eventosService.excluirEvento(ev.id);
      this.eventoParaExcluir.set(null);
    } catch (err: unknown) {
      console.error('Erro ao excluir evento:', err);
      this.erroExclusaoModal.set('Não foi possível excluir o evento.');
    } finally {
      this.excluindoEvento.set(false);
      this.acaoEmAndamentoId.set(null);
    }
  }

  private mapearEvento(dado: Evento): EventoTabelaView {
    const raw = dado as unknown as Record<string, unknown>;
    const id = this.texto(raw['documentId']) || this.texto(raw['id']) || '';
    const titulo = this.texto(raw['titulo']) || 'Evento sem título';
    const area = this.texto(raw['tema'] ?? raw['area']) || 'Tech';
    const empresa = this.texto(raw['empresa_comunidade'] ?? raw['empresa']) || 'Comunidade';
    const subtitulo = `${area} · ${empresa}`;

    const dataObj = this.converterData(raw['data_evento'] ?? raw['data']);
    const horario = this.texto(raw['horario']);
    const dataFormatada = this.formatarDataCurta(dataObj, horario);

    const formato = this.texto(raw['formato']) || 'Presencial';

    const vagasTotais = this.numeroOuNulo(raw['vagas_totais'] ?? raw['vagas']);
    const vagasOcupadas = this.numeroOuNulo(raw['vagas_ocupadas'] ?? raw['inscritos']);
    const participantes = this.textos(raw['participantes_grupo']);

    let vagasTexto = 'Ilimitadas';
    let vagasLimitadas = false;

    if (vagasTotais !== null && vagasTotais > 0) {
      vagasLimitadas = true;
      const ocupadas = vagasOcupadas !== null ? vagasOcupadas : participantes.length;
      vagasTexto = `${ocupadas} / ${vagasTotais}`;
    }

    const statusBruto = this.texto(raw['status']).toLowerCase();
    let statusNormalizado: EventoTabelaView['statusNormalizado'] = 'publicado';
    let statusRotulo = 'Publicado';

    if (statusBruto.includes('rascunho')) {
      statusNormalizado = 'rascunho';
      statusRotulo = 'Rascunho';
    } else if (statusBruto.includes('cancel')) {
      statusNormalizado = 'cancelado';
      statusRotulo = 'Cancelado';
    } else if (statusBruto.includes('encerr') || statusBruto.includes('finaliz')) {
      statusNormalizado = 'encerrado';
      statusRotulo = 'Encerrado';
    }

    const inativo = statusNormalizado === 'cancelado' || statusNormalizado === 'encerrado';

    return {
      id,
      titulo,
      subtitulo,
      dataFormatada,
      dataObj,
      formato,
      vagasTexto,
      vagasLimitadas,
      statusNormalizado,
      statusRotulo,
      participantesCount: participantes.length,
      inativo,
    };
  }

  private formatarDataCurta(data: Date | null, horario: string): string {
    if (!data) {
      return horario || 'A definir';
    }
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return horario ? `${dia}/${mes} · ${horario}` : `${dia}/${mes}`;
  }

  private converterData(valor: unknown): Date | null {
    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? null : valor;
    }
    if (typeof valor === 'string') {
      const limpo = valor.trim();
      const br = limpo.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      if (br) {
        return new Date(Number(br[3]), Number(br[2]) - 1, Number(br[1]));
      }
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

  private numeroOuNulo(valor: unknown): number | null {
    if (typeof valor === 'number' && !Number.isNaN(valor)) return valor;
    if (typeof valor === 'string' && valor.trim() !== '') {
      const n = Number(valor);
      return Number.isNaN(n) ? null : n;
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