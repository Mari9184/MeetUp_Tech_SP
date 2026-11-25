import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import type { Evento } from '../../models/evento';
import { EventosService } from '../../services/eventos.service';

export interface EventoInicio {
  id: string;
  titulo: string;
  dataIso: string;
  mesRotulo: string;
  mesAbrev: string;
  dia: string;
  horario: string;
  local: string;
  acesso: string;
  organizacao: string;
  area: string;
  formato: string;
  publicoAlvo: string[];
  link?: string;
  destaqueStatus?: 'VAGAS LIMITADAS' | 'INICIANTES' | 'MULHERES NA TECH' | 'EXCLUSIVO' | 'ENCERRADO';
  encerrado?: boolean;
  participantesCount?: number;
}

@Component({
  imports: [RouterLink],
  selector: 'app-pagina-inicial',
  styleUrl: './pagina-inicial.css',
  templateUrl: './pagina-inicial.html',
})
export class PaginaInicial {
  private eventosService = inject(EventosService);
  private destroyRef = inject(DestroyRef);

  readonly areas = ['Todas', 'Dados', 'Dev', 'UX/UI', 'Cloud', 'IA', 'Segurança', 'Carreira'] as const;
  readonly formatos = ['Todos', 'Presencial', 'Online', 'Híbrido'] as const;
  readonly publicos = [
    'Todos',
    'Iniciantes',
    'Mulheres na Tech',
    'Intermediário/Avançado',
    'Exclusivo membros',
  ] as const;

  busca = signal('');
  areaSelecionada = signal<string>('Todas');
  formatoSelecionado = signal<string>('Todos');
  publicoSelecionado = signal<string>('Todos');
  visualizacao = signal<'grade' | 'calendario'>('grade');
  ordenacao = signal<'proxima' | 'titulo'>('proxima');
  mostrarTodos = signal(false);
  carregandoEventos = signal(true);
  erroEventos = signal('');
  eventosBase = signal<EventoInicio[]>([]);

  eventoDestaque = computed(() => {
    const ativos = this.eventosBase().filter((evento) => !evento.encerrado);
    return ativos[0] ?? this.eventosBase()[0] ?? null;
  });

  eventosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const area = this.areaSelecionada();
    const formato = this.formatoSelecionado();
    const publico = this.publicoSelecionado();
    const ordem = this.ordenacao();

    const lista = this.eventosBase().filter((evento) => {
      const bateBusca =
        !termo ||
        evento.titulo.toLowerCase().includes(termo) ||
        evento.organizacao.toLowerCase().includes(termo) ||
        evento.local.toLowerCase().includes(termo) ||
        evento.acesso.toLowerCase().includes(termo);

      const bateArea = area === 'Todas' || evento.area === area;
      const bateFormato = formato === 'Todos' || evento.formato === formato;
      const batePublico = publico === 'Todos' || evento.publicoAlvo.includes(publico);

      return bateBusca && bateArea && bateFormato && batePublico;
    });

    return [...lista].sort((a, b) => {
      if (ordem === 'titulo') {
        return a.titulo.localeCompare(b.titulo, 'pt-BR');
      }
      if (!a.dataIso && !b.dataIso) return 0;
      if (!a.dataIso) return 1;
      if (!b.dataIso) return -1;
      return a.dataIso.localeCompare(b.dataIso);
    });
  });

  eventosVisiveis = computed(() =>
    this.mostrarTodos() ? this.eventosFiltrados() : this.eventosFiltrados().slice(0, 6),
  );

  gruposPorMes = computed(() => {
    const mapa = new Map<string, EventoInicio[]>();
    for (const evento of this.eventosVisiveis()) {
      const grupo = mapa.get(evento.mesRotulo) ?? [];
      grupo.push(evento);
      mapa.set(evento.mesRotulo, grupo);
    }
    return Array.from(mapa.entries()).map(([mes, eventos]) => ({ mes, eventos }));
  });

  constructor() {
    this.eventosService
      .listarEventos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (eventos) => {
          this.eventosBase.set(eventos.map((evento) => this.converterEvento(evento)));
          this.carregandoEventos.set(false);
          this.erroEventos.set('');
        },
        error: (erro: unknown) => {
          console.error('Erro ao carregar eventos do Firestore:', erro);
          this.erroEventos.set('Não foi possível carregar os eventos. Tente novamente mais tarde.');
          this.carregandoEventos.set(false);
        },
      });
  }

  limparFiltros() {
    this.busca.set('');
    this.areaSelecionada.set('Todas');
    this.formatoSelecionado.set('Todos');
    this.publicoSelecionado.set('Todos');
    this.ordenacao.set('proxima');
  }

  alternarOrdenacao() {
    this.ordenacao.update((atual) => (atual === 'proxima' ? 'titulo' : 'proxima'));
  }

  classeArea(area: string): string {
    switch (area) {
      case 'Dev':
        return 'etiqueta-desenvolvimento';
      case 'Dados':
        return 'etiqueta-dados';
      case 'UX/UI':
        return 'etiqueta-ux-ui';
      case 'IA':
        return 'etiqueta-ia';
      case 'Cloud':
        return 'etiqueta-nuvem';
      case 'Segurança':
        return 'etiqueta-seguranca';
      default:
        return 'etiqueta-desenvolvimento';
    }
  }

  urlGoogleAgenda(evento: EventoInicio): string {
    const { inicioUtc, fimUtc } = this.montarIntervaloGoogleCalendar(evento.dataIso, evento.horario);
    const detalhes = [
      evento.organizacao ? `Organização: ${evento.organizacao}` : '',
      evento.acesso ? `Acesso: ${evento.acesso}` : '',
      evento.link ? `Inscrição / Link: ${evento.link}` : '',
    ]
      .filter(Boolean)
      .join('\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: evento.titulo,
      dates: `${inicioUtc}/${fimUtc}`,
      ctz: 'America/Sao_Paulo',
      location: evento.local || '',
      details: detalhes,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  private montarIntervaloGoogleCalendar(
    dataIso: string,
    horarioTexto: string,
  ): { inicioUtc: string; fimUtc: string } {
    const matchHora = horarioTexto.match(/(\d{1,2}):(\d{2})/);
    const matchData = dataIso.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!matchData) {
      return {
        inicioUtc: '20261210T220000Z',
        fimUtc: '20261211T000000Z',
      };
    }

    const ano = Number(matchData[1]);
    const mes = Number(matchData[2]) - 1;
    const dia = Number(matchData[3]);
    const hora = matchHora ? Number(matchHora[1]) : 19;
    const minuto = matchHora ? Number(matchHora[2]) : 0;

    // São Paulo (BRT) é UTC-3 -> soma 3h para gerar o timestamp em UTC
    const inicioDate = new Date(Date.UTC(ano, mes, dia, hora + 3, minuto, 0));
    const fimDate = new Date(inicioDate.getTime() + 2 * 60 * 60 * 1000);

    return {
      inicioUtc: this.formatarUtcCalendar(inicioDate),
      fimUtc: this.formatarUtcCalendar(fimDate),
    };
  }

  private formatarUtcCalendar(data: Date): string {
    const yyyy = data.getUTCFullYear();
    const mm = String(data.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(data.getUTCDate()).padStart(2, '0');
    const hh = String(data.getUTCHours()).padStart(2, '0');
    const min = String(data.getUTCMinutes()).padStart(2, '0');
    const ss = String(data.getUTCSeconds()).padStart(2, '0');
    return `${yyyy}${mm}${dd}T${hh}${min}${ss}Z`;
  }

  private converterEvento(evento: Evento): EventoInicio {
    const raw = evento as unknown as Record<string, unknown>;
    const dataBruta = raw['data_evento'] ?? raw['data'];
    const data = this.converterData(dataBruta);

    const status = this.texto(raw['status']);
    const tags = [...this.textos(raw['tags']), ...(status ? [status] : [])];
    const publicoAlvo = this.textos(raw['publico_alvo']).map((publico) =>
      this.normalizarPublico(publico),
    );
    const destaqueStatus = this.encontrarDestaque([...tags, ...publicoAlvo]);

    const vagas = typeof raw['vagas'] === 'number' ? raw['vagas'] : null;
    const dataIso = data
      ? `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`
      : '';
    const mesAbrev = data
      ? new Intl.DateTimeFormat('pt-BR', { month: 'short' })
          .format(data)
          .replace('.', '')
          .toUpperCase()
      : '---';
    const dia = data ? String(data.getDate()).padStart(2, '0') : '--';
    const mesRotulo = data
      ? new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' })
          .format(data)
          .toUpperCase()
      : 'DATA A DEFINIR';

    const horaInicio = this.texto(raw['horario'] ?? raw['inicio']);
    const termino = this.texto(raw['termino']);
    const diaSemana = data
      ? new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(data).replace('.', '')
      : '';

    const horario = data
      ? `${diaSemana}, ${dia} ${mesAbrev.toLowerCase()}${horaInicio ? ` · ${horaInicio}` : ''}${termino ? ` – ${termino}` : ''}`
      : horaInicio
        ? `Horário: ${horaInicio}${termino ? ` – ${termino}` : ''}`
        : 'Data e horário a definir';

    const encerrado =
      destaqueStatus === 'ENCERRADO' ||
      this.normalizarTexto(status) === 'cancelado' ||
      (vagas !== null && vagas <= 0);

    const origemArea = this.texto(raw['area']) || this.texto(raw['tema']) || tags[0] || '';
    const estacao = this.texto(raw['estacao_metro'] ?? raw['estacao']);
    const localizacao = this.texto(raw['localizacao'] ?? raw['local']);
    const empresa = this.texto(raw['empresa_comunidade'] ?? raw['empresa']);
    const participantesValidos = this.textos(raw['participantes_grupo']).filter(
      (item) => item.length > 0,
    );

    return {
      id: this.texto(raw['documentId']) || this.texto(raw['id_evento']) || 'evento',
      titulo: this.texto(raw['titulo']) || 'Evento sem título',
      dataIso,
      mesRotulo,
      mesAbrev,
      dia,
      horario,
      local: localizacao || 'Local a confirmar',
      acesso: estacao ? `Estação ${estacao}` : 'Estação não informada',
      organizacao: empresa || 'Organização não informada',
      area: this.normalizarArea(origemArea),
      formato: this.normalizarFormato(raw['formato']),
      publicoAlvo,
      link: this.texto(raw['link']),
      destaqueStatus,
      encerrado,
      participantesCount: participantesValidos.length,
    };
  }

  private converterData(valor: unknown): Date | null {
    if (valor instanceof Date) {
      return Number.isNaN(valor.getTime()) ? null : valor;
    }

    if (typeof valor === 'string') {
      const valorTrim = valor.trim();
      if (!valorTrim) return null;

      const dataIso = valorTrim.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const dataBrasileira = valorTrim.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
      const data = dataIso
        ? new Date(Number(dataIso[1]), Number(dataIso[2]) - 1, Number(dataIso[3]))
        : dataBrasileira
          ? new Date(Number(dataBrasileira[3]), Number(dataBrasileira[2]) - 1, Number(dataBrasileira[1]))
          : new Date(valorTrim);

      return Number.isNaN(data.getTime()) ? null : data;
    }

    if (valor && typeof valor === 'object' && 'toDate' in valor && typeof valor.toDate === 'function') {
      const data = valor.toDate();
      return data instanceof Date && !Number.isNaN(data.getTime()) ? data : null;
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

  private normalizarArea(valor: unknown): string {
    const original = this.texto(valor);
    const area = this.normalizarTexto(original);

    if (area.includes('dev') || area.includes('frontend') || area.includes('front end') || area === 'web') {
      return 'Dev';
    }
    if (area.includes('dados')) return 'Dados';
    if (area.includes('ux') || area.includes('ui')) return 'UX/UI';
    if (area.includes('cloud') || area.includes('nuvem')) return 'Cloud';
    if (area.includes('inteligencia artificial') || area === 'ia') return 'IA';
    if (area.includes('seguranca')) return 'Segurança';
    if (area.includes('carreira')) return 'Carreira';

    return original || 'Área a definir';
  }

  private normalizarFormato(valor: unknown): string {
    const original = this.texto(valor);
    const formato = this.normalizarTexto(original);

    if (formato.includes('online')) return 'Online';
    if (formato.includes('hibrido')) return 'Híbrido';
    if (formato.includes('presencial')) return 'Presencial';

    return original || 'Formato a definir';
  }

  private normalizarPublico(valor: string): string {
    const publico = this.normalizarTexto(valor);

    if (publico.includes('iniciantes')) return 'Iniciantes';
    if (publico.includes('mulheres')) return 'Mulheres na Tech';
    if (publico.includes('intermediario') || publico.includes('avancado')) {
      return 'Intermediário/Avançado';
    }
    if (publico.includes('membros') || publico.includes('exclusivo')) return 'Exclusivo membros';
    if (publico.includes('todos')) return 'Todos os níveis';

    return valor;
  }

  private normalizarTexto(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  private encontrarDestaque(tags: string[]): EventoInicio['destaqueStatus'] {
    const destaques: Exclude<EventoInicio['destaqueStatus'], undefined>[] = [
      'VAGAS LIMITADAS',
      'INICIANTES',
      'MULHERES NA TECH',
      'EXCLUSIVO',
      'ENCERRADO',
    ];
    const tagsNormalizadas = tags.map((tag) => this.normalizarTexto(tag).toUpperCase());

    return destaques.find((destaque) =>
      tagsNormalizadas.some((tag) => tag.includes(this.normalizarTexto(destaque).toUpperCase())),
    );
  }
}