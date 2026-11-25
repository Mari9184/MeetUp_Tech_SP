import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { MenuLateral } from '../../componentes/menu-lateral/menu-lateral';
import { EventosService } from '../../services/eventos.service';

export type FormatoEvento = 'presencial' | 'online' | 'hibrido';

export interface OpcaoPublico {
  valor: string;
  rotulo: string;
}

export interface OpcaoSelo {
  id: string;
  rotulo: string;
  classeCor: 'selo-laranja' | 'selo-azul' | 'selo-roxo' | 'selo-rosa' | 'selo-cinza';
}

@Component({
  imports: [MenuLateral, FormsModule, RouterLink],
  selector: 'app-cadastrando-evento-adm',
  styleUrl: './cadastrando-evento-adm.css',
  templateUrl: './cadastrando-evento-adm.html',
})
export class CadastrandoEventoAdm {
  private eventosService = inject(EventosService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  readonly opcoesArea = [
    'Dev · Front-end',
    'Dados',
    'UX/UI',
    'Cloud',
    'Inteligência Artificial',
    'Segurança',
  ];

  readonly opcoesPublico: OpcaoPublico[] = [
    { valor: 'todos', rotulo: 'Todos os níveis' },
    { valor: 'iniciantes', rotulo: 'Iniciantes' },
    { valor: 'mulheres', rotulo: 'Mulheres na Tech' },
    { valor: 'intermediario', rotulo: 'Intermediário/Avançado' },
    { valor: 'membros', rotulo: 'Exclusivo membros' },
  ];

  readonly opcoesSelos: OpcaoSelo[] = [
    { id: 'vagas-limitadas', rotulo: 'VAGAS LIMITADAS', classeCor: 'selo-laranja' },
    { id: 'iniciantes', rotulo: 'INICIANTES', classeCor: 'selo-azul' },
    { id: 'exclusivo', rotulo: 'EXCLUSIVO', classeCor: 'selo-roxo' },
    { id: 'mulheres-na-tech', rotulo: 'MULHERES NA TECH', classeCor: 'selo-rosa' },
    { id: 'encerrado', rotulo: 'ENCERRADO', classeCor: 'selo-cinza' },
  ];

  eventoId = signal<string | null>(null);
  modoEdicao = computed(() => Boolean(this.eventoId()));

  salvando = signal(false);
  erro = signal('');
  mensagemSucesso = signal('');

  // Campos vazios por padrão para novo cadastro
  titulo = signal('');
  area = signal('Dev · Front-end');
  empresa = signal('');
  descricao = signal('');

  dataEvento = signal('');
  horarioInicio = signal('');
  horarioTermino = signal('');
  formato = signal<FormatoEvento>('presencial');
  local = signal('');
  estacao = signal('');

  linkInscricao = signal('');
  publicosSelecionados = signal<string[]>([]);
  selosSelecionados = signal<string[]>([]);

  totalCaracteres = computed(() => this.descricao().length);

  mesCartao = computed(() => {
    const data = this.parseData(this.dataEvento());
    if (!data) return 'MÊS';
    return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(data)
      .replace('.', '')
      .toUpperCase();
  });

  diaCartao = computed(() => {
    const data = this.parseData(this.dataEvento());
    if (!data) return '--';
    return String(data.getDate()).padStart(2, '0');
  });

  dataDetalhePrevia = computed(() => {
    const data = this.parseData(this.dataEvento());
    const inicio = this.horarioInicio().trim();
    const termino = this.horarioTermino().trim();

    const faixaHora = inicio && termino ? `${inicio} – ${termino}` : inicio || termino;

    if (!data) {
      return faixaHora || 'Data a definir';
    }

    const diaSemana = new Intl.DateTimeFormat('pt-BR', { weekday: 'short' })
      .format(data)
      .replace('.', '');
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
      .format(data)
      .replace('.', '');

    const capitalizado = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1);
    const dataTexto = `${capitalizado}, ${dia} ${mes}`;
    return faixaHora ? `${dataTexto} · ${faixaHora}` : dataTexto;
  });

  selosAtivosView = computed(() => {
    const ativos = new Set(this.selosSelecionados());
    return this.opcoesSelos.filter((s) => ativos.has(s.id));
  });

  completude = computed(() => {
    const temBasico = Boolean(
      this.titulo().trim() && this.area().trim() && this.empresa().trim(),
    );
    const temDataFormato = Boolean(
      this.dataEvento().trim() && this.horarioInicio().trim() && this.formato(),
    );
    const temLocal = Boolean(this.local().trim());
    const temPublico = this.publicosSelecionados().length > 0;
    const temLink = this.linkValido(this.linkInscricao());

    const itens = [
      { rotulo: 'Título, área e empresa', completo: temBasico },
      { rotulo: 'Data, horário e formato', completo: temDataFormato },
      { rotulo: 'Local e estação por perto', completo: temLocal },
      { rotulo: 'Público-alvo', completo: temPublico },
      { rotulo: 'Link de inscrição válido', completo: temLink },
    ];

    const pontos = itens.filter((i) => i.completo).length * 2;
    return {
      pontos,
      totalPontos: 10,
      itens,
    };
  });

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.eventoId.set(id);
          this.carregarEventoExistente(id);
        } else {
          this.eventoId.set(null);
        }
      });
  }

  publicoMarcado(valor: string): boolean {
    return this.publicosSelecionados().includes(valor);
  }

  alternarPublico(valor: string) {
    const atual = this.publicosSelecionados();
    if (atual.includes(valor)) {
      this.publicosSelecionados.set(atual.filter((item) => item !== valor));
    } else {
      this.publicosSelecionados.set([...atual, valor]);
    }
  }

  seloMarcado(id: string): boolean {
    return this.selosSelecionados().includes(id);
  }

  alternarSelo(id: string) {
    const atual = this.selosSelecionados();
    if (atual.includes(id)) {
      this.selosSelecionados.set(atual.filter((item) => item !== id));
    } else {
      this.selosSelecionados.set([...atual, id]);
    }
  }

  async aoSubmitFormulario(event: Event) {
    event.preventDefault();
    await this.salvarEvento('Publicado');
  }

  async salvarRascunho() {
    await this.salvarEvento('Rascunho');
  }

  async cancelarEventoExistente() {
    const id = this.eventoId();
    if (!id || this.salvando()) return;

    const confirmou = window.confirm(
      `Deseja marcar "${this.titulo().trim() || 'este evento'}" como Cancelado?`,
    );
    if (!confirmou) return;

    this.salvando.set(true);
    this.erro.set('');
    this.mensagemSucesso.set('');

    try {
      await this.eventosService.atualizarEvento(id, {
        status: 'Cancelado',
        atualizado_em: new Date().toISOString(),
      });
      this.mensagemSucesso.set('Evento marcado como cancelado.');
      await this.router.navigate(['/eventos']);
    } catch (err: unknown) {
      console.error('Erro ao cancelar evento:', err);
      this.erro.set('Não foi possível cancelar o evento.');
    } finally {
      this.salvando.set(false);
    }
  }

  private async salvarEvento(status: 'Publicado' | 'Rascunho') {
    if (this.salvando()) return;

    this.erro.set('');
    this.mensagemSucesso.set('');

    const tituloLimpo = this.titulo().trim();
    const areaLimpa = this.area().trim();
    const empresaLimpa = this.empresa().trim();
    const dataLimpa = this.dataEvento().trim();
    const inicioLimpo = this.horarioInicio().trim();
    const localLimpo = this.local().trim();
    const linkLimpo = this.linkInscricao().trim();

    if (status === 'Publicado') {
      if (!tituloLimpo || !areaLimpa || !empresaLimpa || !dataLimpa || !inicioLimpo || !localLimpo) {
        this.erro.set('Preencha todos os campos obrigatórios (*) antes de publicar.');
        return;
      }
      if (!linkLimpo || !this.linkValido(linkLimpo)) {
        this.erro.set('Informe um link de inscrição válido (começando com http:// ou https://).');
        return;
      }
    } else if (!tituloLimpo) {
      this.erro.set('Informe pelo menos o título do evento para salvar o rascunho.');
      return;
    }

    this.salvando.set(true);

    const formatoRotulo = this.rotuloFormato(this.formato());
    const horarioResumo = this.horarioTermino().trim()
      ? `${inicioLimpo} – ${this.horarioTermino().trim()}`
      : inicioLimpo;

    const payload: Record<string, unknown> = {
      titulo: tituloLimpo,
      tema: areaLimpa,
      area: areaLimpa,
      empresa_comunidade: empresaLimpa,
      empresa: empresaLimpa,
      descricao: this.descricao().trim(),
      data_evento: this.normalizarDataParaBanco(dataLimpa),
      horario: horarioResumo,
      horario_inicio: inicioLimpo,
      horario_termino: this.horarioTermino().trim(),
      formato: formatoRotulo,
      local: localLimpo,
      estacao_proxima: this.estacao().trim(),
      link_inscricao: linkLimpo,
      publico_alvo: this.publicosSelecionados(),
      selos: this.selosSelecionados(),
      status,
    };

    try {
      const idAtual = this.eventoId();
      if (idAtual) {
        await this.eventosService.atualizarEvento(idAtual, {
          ...payload,
          atualizado_em: new Date().toISOString(),
        });
        this.mensagemSucesso.set(
          status === 'Rascunho' ? 'Rascunho atualizado.' : 'Evento atualizado com sucesso.',
        );
      } else {
        await this.eventosService.criarEvento({
          ...payload,
          participantes_grupo: [],
          criado_em: new Date().toISOString(),
        });
        this.mensagemSucesso.set(
          status === 'Rascunho' ? 'Rascunho salvo.' : 'Evento publicado com sucesso.',
        );
      }

      await this.router.navigate(['/eventos']);
    } catch (err: unknown) {
      console.error('Erro ao salvar evento:', err);
      this.erro.set('Não foi possível salvar o evento no banco.');
    } finally {
      this.salvando.set(false);
    }
  }

  private carregarEventoExistente(id: string) {
    this.eventosService
      .listarEventos()
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          const encontrado = (lista ?? []).find((item) => {
            const raw = item as unknown as Record<string, unknown>;
            return raw['documentId'] === id || raw['id'] === id;
          });
          if (!encontrado) {
            this.erro.set('Evento não encontrado para edição.');
            return;
          }

          const raw = encontrado as unknown as Record<string, unknown>;
          this.titulo.set(this.texto(raw['titulo']));
          this.area.set(this.texto(raw['tema'] ?? raw['area']) || 'Dev · Front-end');
          this.empresa.set(this.texto(raw['empresa_comunidade'] ?? raw['empresa']));
          this.descricao.set(this.texto(raw['descricao']));

          const dataObj = this.parseData(raw['data_evento'] ?? raw['data']);
          if (dataObj) {
            const d = String(dataObj.getDate()).padStart(2, '0');
            const m = String(dataObj.getMonth() + 1).padStart(2, '0');
            const a = dataObj.getFullYear();
            this.dataEvento.set(`${d}/${m}/${a}`);
          }

          const inicio = this.texto(raw['horario_inicio']);
          const termino = this.texto(raw['horario_termino']);
          const horarioGeral = this.texto(raw['horario']);
          if (inicio) {
            this.horarioInicio.set(inicio);
            this.horarioTermino.set(termino);
          } else if (horarioGeral.includes('–')) {
            const [ini, fim] = horarioGeral.split('–').map((p) => p.trim());
            this.horarioInicio.set(ini || '');
            this.horarioTermino.set(fim || '');
          } else if (horarioGeral) {
            this.horarioInicio.set(horarioGeral);
          }

          const formatoStr = this.texto(raw['formato']).toLowerCase();
          if (formatoStr.includes('online')) this.formato.set('online');
          else if (formatoStr.includes('hibr') || formatoStr.includes('híbr')) this.formato.set('hibrido');
          else this.formato.set('presencial');

          this.local.set(this.texto(raw['local']));
          this.estacao.set(this.texto(raw['estacao_proxima'] ?? raw['estacao']));
          this.linkInscricao.set(this.texto(raw['link_inscricao'] ?? raw['inscricao']));

          if (Array.isArray(raw['publico_alvo'])) {
            this.publicosSelecionados.set(
              raw['publico_alvo'].filter((v): v is string => typeof v === 'string'),
            );
          }
          if (Array.isArray(raw['selos'])) {
            this.selosSelecionados.set(
              raw['selos'].filter((v): v is string => typeof v === 'string'),
            );
          }
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar evento para edição:', err);
          this.erro.set('Não foi possível carregar os dados do evento.');
        },
      });
  }

  private rotuloFormato(fmt: FormatoEvento): string {
    if (fmt === 'online') return 'Online';
    if (fmt === 'hibrido') return 'Híbrido';
    return 'Presencial';
  }

  private normalizarDataParaBanco(valor: string): string {
    const data = this.parseData(valor);
    if (!data) return valor;
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }

  private parseData(valor: unknown): Date | null {
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

  private linkValido(url: string): boolean {
    const limpo = url.trim();
    if (!limpo) return false;
    try {
      const parsed = new URL(limpo);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor : '';
  }
}