import { Injectable, computed, signal } from '@angular/core';
import {
  Administrador,
  DadosEdicaoAdministrador,
  DadosNovoAdministrador,
} from '../models/administrador.model';

/**
 * Guarda a lista de administradores do painel.
 *
 * Por enquanto os dados ficam só na memória do navegador.
 * Quando o backend existir, troque o conteúdo de cada função
 * por uma chamada HTTP (HttpClient) mantendo os mesmos nomes.
 */
@Injectable({ providedIn: 'root' })
export class AdministradoresService {
  private readonly lista = signal<Administrador[]>([
    { id: 1, nome: 'Gabriel T.', email: 'gabriel@meetuptech.example', perfil: 'Fundador' },
    { id: 2, nome: 'Mariana Costa', email: 'mariana@meetuptech.example', perfil: 'Administrador' },
    { id: 3, nome: 'Lucas Almeida', email: 'lucas@meetuptech.example', perfil: 'Administrador' },
  ]);

  /** Lista somente leitura para os componentes. */
  readonly administradores = this.lista.asReadonly();

  /** Total de administradores cadastrados. */
  readonly total = computed(() => this.lista().length);

  /** Verifica se já existe alguém com o e-mail informado. */
  emailJaCadastrado(email: string, ignorarId?: number): boolean {
    const emailNormalizado = email.trim().toLowerCase();
    return this.lista().some(
      (admin) => admin.email.toLowerCase() === emailNormalizado && admin.id !== ignorarId,
    );
  }

  /**
   * Cadastra um novo administrador.
   * Retorna `false` se o e-mail já estiver em uso.
   */
  cadastrar(dados: DadosNovoAdministrador): boolean {
    if (this.emailJaCadastrado(dados.email)) {
      return false;
    }

    // A senha deve ser enviada apenas para o backend, que a guarda criptografada (RNF04).
    // Ela nunca fica salva aqui no front-end.
    const novo: Administrador = {
      id: this.gerarNovoId(),
      nome: dados.nome.trim(),
      email: dados.email.trim().toLowerCase(),
      perfil: 'Administrador',
    };

    this.lista.update((atual) => [...atual, novo]);
    return true;
  }

  /**
   * Atualiza nome e e-mail de um administrador.
   * Retorna `false` se o e-mail já pertencer a outra pessoa.
   */
  atualizar(id: number, dados: DadosEdicaoAdministrador): boolean {
    if (this.emailJaCadastrado(dados.email, id)) {
      return false;
    }

    this.lista.update((atual) =>
      atual.map((admin) =>
        admin.id === id
          ? { ...admin, nome: dados.nome.trim(), email: dados.email.trim().toLowerCase() }
          : admin,
      ),
    );
    return true;
  }

  /** Remove o acesso de um administrador. O fundador não pode ser removido. */
  excluir(id: number): void {
    this.lista.update((atual) =>
      atual.filter((admin) => admin.id !== id || admin.perfil === 'Fundador'),
    );
  }

  private gerarNovoId(): number {
    return Math.max(0, ...this.lista().map((admin) => admin.id)) + 1;
  }
}
