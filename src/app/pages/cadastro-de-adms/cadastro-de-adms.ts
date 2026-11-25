import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MenuLateral } from '../../componentes/menu-lateral/menu-lateral';
import {
  NovoAdministrador,
  type DadosNovoAdministrador,
} from '../../componentes/novo-administrador/novo-administrador';
import { ExcluirAdministrador } from '../../componentes/excluir-administrador/excluir-administrador';
import { AuthService } from '../../services/auth.services';
import type { Administrador } from '../../models/administrador';

export interface AdministradorView {
  chaveLista: string;
  id: string;
  nomeCompleto: string;
  nome: string;
  sobrenome: string;
  email: string;
  perfil: string;
  ehContaPropria: boolean;
}

@Component({
  imports: [MenuLateral, NovoAdministrador, ExcluirAdministrador],
  selector: 'app-cadastro-de-adms',
  styleUrl: './cadastro-de-adms.css',
  templateUrl: './cadastro-de-adms.html',
})
export class CadastroDeAdms {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  carregando = signal(true);
  erro = signal('');
  termoBusca = signal('');
  uidAtual = signal<string | null>(this.authService.getAdminUid());
  administradores = signal<AdministradorView[]>([]);
  rawAdministradores = signal<Administrador[]>([]);

  // Estado do modal (NovoAdministrador)
  modalAberto = signal(false);
  modoEdicao = signal(false);
  adminEditando = signal<AdministradorView | null>(null);
  salvandoModal = signal(false);
  erroModal = signal('');

  // Estado do modal de exclusão (ExcluirAdministrador)
  adminParaExcluir = signal<AdministradorView | null>(null);
  excluindoAdmin = signal(false);
  erroExclusaoModal = signal('');

  dadosIniciaisModal = computed(() => {
    const editando = this.adminEditando();
    if (!editando) return null;
    return {
      nome: editando.nomeCompleto,
      email: editando.email,
    };
  });

  administradoresFiltrados = computed(() => {
    const busca = this.termoBusca().trim().toLowerCase();
    const lista = this.administradores();
    if (!busca) return lista;

    return lista.filter(
      (adm) =>
        adm.nomeCompleto.toLowerCase().includes(busca) ||
        adm.email.toLowerCase().includes(busca) ||
        adm.perfil.toLowerCase().includes(busca),
    );
  });

  constructor() {
    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.uidAtual.set(user ? user.uid : this.authService.getAdminUid());
        this.recalcularLista();
      });

    this.authService
      .listarAdministradores()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (lista) => {
          this.rawAdministradores.set(Array.isArray(lista) ? lista : []);
          this.recalcularLista();
          this.erro.set('');
          this.carregando.set(false);
        },
        error: (err: unknown) => {
          console.error('Erro ao carregar administradores:', err);
          this.rawAdministradores.set([]);
          this.administradores.set([]);
          this.erro.set('Não foi possível carregar os administradores do banco.');
          this.carregando.set(false);
        },
      });
  }

  atualizarBusca(valor: string) {
    this.termoBusca.set(valor);
  }

  abrirNovoAdministrador() {
    this.modoEdicao.set(false);
    this.adminEditando.set(null);
    this.erroModal.set('');
    this.modalAberto.set(true);
  }

  abrirEditarAdministrador(adm: AdministradorView) {
    if (!adm.id) return;
    this.modoEdicao.set(true);
    this.adminEditando.set(adm);
    this.erroModal.set('');
    this.modalAberto.set(true);
  }

  fecharModal() {
    if (!this.salvandoModal()) {
      this.modalAberto.set(false);
      this.adminEditando.set(null);
      this.erroModal.set('');
    }
  }

  async aoConfirmarModal(dados: DadosNovoAdministrador) {
    if (this.salvandoModal()) return;

    this.salvandoModal.set(true);
    this.erroModal.set('');

    const nomeLimpo = dados.nome.trim();
    const emailLimpo = dados.email.trim();

    try {
      if (this.modoEdicao()) {
        const atual = this.adminEditando();
        if (!atual?.id) {
          this.erroModal.set('Administrador sem identificador no banco para edição.');
          return;
        }
        await this.authService.editarAdministrador(atual.id, {
          nome: nomeLimpo,
          email: emailLimpo,
        });
      } else {
        await this.authService.cadastrarAdministrador(nomeLimpo, '', emailLimpo, dados.senha);
      }

      this.modalAberto.set(false);
      this.adminEditando.set(null);
    } catch (err: unknown) {
      console.error('Erro ao salvar administrador:', err);
      this.erroModal.set(
        this.modoEdicao()
          ? 'Não foi possível atualizar os dados do administrador.'
          : 'Não foi possível cadastrar o administrador. Verifique o e-mail e a senha.',
      );
    } finally {
      this.salvandoModal.set(false);
    }
  }

  solicitarExclusao(adm: AdministradorView) {
    if (!adm.id || adm.ehContaPropria || this.excluindoAdmin()) return;
    this.erroExclusaoModal.set('');
    this.adminParaExcluir.set(adm);
  }

  cancelarExclusao() {
    if (this.excluindoAdmin()) return;
    this.adminParaExcluir.set(null);
    this.erroExclusaoModal.set('');
  }

  async confirmarExclusao() {
    const adm = this.adminParaExcluir();
    if (!adm?.id || adm.ehContaPropria || this.excluindoAdmin()) return;

    this.excluindoAdmin.set(true);
    this.erroExclusaoModal.set('');

    try {
      await this.authService.excluirAdministrador(adm.id);
      this.adminParaExcluir.set(null);
    } catch (err: unknown) {
      console.error('Erro ao excluir administrador:', err);
      this.erroExclusaoModal.set('Não foi possível excluir o administrador.');
    } finally {
      this.excluindoAdmin.set(false);
    }
  }

  private recalcularLista() {
    const uidLogado = this.uidAtual();
    const lista = this.rawAdministradores().map((item, index) => {
      const raw = item as unknown as Record<string, unknown>;
      const id =
        this.texto(raw['uid']) ||
        this.texto(raw['id']) ||
        this.texto(raw['documentId']) ||
        '';
      const nome =
        this.texto(raw['nome']) ||
        this.texto(raw['name']) ||
        this.texto(raw['primeiroNome']);
      const sobrenome =
        this.texto(raw['sobrenome']) ||
        this.texto(raw['lastName']);
      const email =
        this.texto(raw['email']) ||
        this.texto(raw['e-mail']) ||
        this.texto(raw['correo']);
      const perfil = this.texto(raw['perfil']) || this.texto(raw['cargo']) || 'Administrador';
      const nomeCompleto =
        [nome, sobrenome].filter(Boolean).join(' ') || email || 'Administrador sem nome';

      return {
        chaveLista: id || `${email}-${index}`,
        id,
        nome,
        sobrenome,
        nomeCompleto,
        email,
        perfil,
        ehContaPropria: Boolean(uidLogado && id && id === uidLogado),
      };
    });

    this.administradores.set(lista);
  }

  private texto(valor: unknown): string {
    return typeof valor === 'string' ? valor.trim() : '';
  }
}