import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuLateral } from '../../componentes/menu-lateral/menu-lateral';
import { EventosService } from '../../services/eventos.service';
import type { Evento } from '../../models/evento';

export interface EventoGrupoView {
  id: string;
  titulo: string;
  categoriaTopo: string;
  dataCartao: string;
  dataCompleta: string;
  participantes: string[];
  quantidadeTexto: string;
}

@Component({
  imports: [MenuLateral],
  selector: 'app-ir-em-grupo-adms',
  styleUrl: './ir-em-grupo-adms.css',
  templateUrl: './ir-em-grupo-adms.html',
})
export class IrEmGrupoAdms {
  private eventosService = inject(EventosService);
  private destroyRef = inject(DestroyRef);

  termoBusca = signal('');
  carregando = signal(true);
  erro = signal('');
  eventos = signal<EventoGrupoView[]>([]);
  eventoSelecionadoId = signal<string>('');

  eventosFiltrados = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    const lista = this.eventos();
    if (!busca) {
      return lista;
    }
    return lista.filter((ev) => ev.titulo.toLowerCase().includes(busca));
  });

  eventoSelecionado = computed(() => {
    const filtrados = this.eventosFiltrados();
    const selecionadoId = this.eventoSelecionadoId();

    if (filtrados.length === 0) {
      return null;
    }

    return filtrados.find((ev) => ev.id === selecionadoId) ?? filtrados[0];
  });

  constructor() {
    this.eventosService
      .listarEventos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          const mapeados = (lista ?? []).map((item) => this.mapearEvento(item));
          this.eventos.set(mapeados);

          const atualId = this.eventoSelecionadoId();
          if (!atualId || !mapeados.some((ev) => ev.id === atualId)) {
            this.eventoSelecionadoId.set(mapeados[0]?.id ?? '');
          }

          this.erro.set('');
          this.carregando.set(false);
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar eventos para ir em grupo:', err);
          this.eventos.set([]);
          this.erro.set('Não foi possível carregar os eventos do banco.');
          this.carregando.set(false);
        },
      });
  }

  selecionarEvento(id: string, event?: Event) {
    event?.preventDefault();
    this.eventoSelecionadoId.set(id);
  }

  atualizarBusca(valor: string) {
    this.termoBusca.set(valor);
  }

  private mapearEvento(dado: Evento): EventoGrupoView {
    const raw = dado as unknown as Record<string, unknown>;
    const id = this.texto(raw['documentId']) || this.texto(raw['id']) || crypto.randomUUID();
    const titulo = this.texto(raw['titulo']) || 'Evento sem título';
    const data = this.converterData(raw['data_evento'] ?? raw['data']);
    const horario = this.texto(raw['horario']);
    const tema = this.texto(raw['tema'] ?? raw['area']);
    const tags = this.textos(raw['tags']);
    const participantes = this.textos(raw['participantes_grupo']).filter((p) => p.length > 0);

    const categoriaTopo = (tema || tags[0] || 'EVENTO DA COMUNIDADE').toUpperCase();

    const dataCartao = this.formatarDataCartao(data, horario);
    const dataCompleta = this.formatarDataCompleta(data, horario);

    const quantidadeTexto =
      participantes.length === 0
        ? 'Sem participantes'
        : participantes.length === 1
          ? '1 participante'
          : `${participantes.length} participantes`;

    return {
      id,
      titulo,
      categoriaTopo,
      dataCartao,
      dataCompleta,
      participantes,
      quantidadeTexto,
    };
  }

  private formatarDataCartao(data: Date | null, horario: string): string {
    const partes: string[] = [];
    if (data) {
      const dia = String(data.getDate()).padStart(2, '0');
      const mes = new Intl.DateTimeFormat('pt-BR', { month: 'short' })
        .format(data)
        .replace('.', '');
      const ano = data.getFullYear();
      partes.push(`${dia} ${mes} ${ano}`);
    }
    if (horario) {
      partes.push(horario);
    }
    return partes.join(' · ') || 'Data a definir';
  }

  private formatarDataCompleta(data: Date | null, horario: string): string {
    const dataTexto = data
      ? new Intl.DateTimeFormat('pt-BR', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }).format(data)
      : 'Data a definir';

    return horario ? `${dataTexto} · ${horario}` : dataTexto;
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