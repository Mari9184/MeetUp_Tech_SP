import { Component, computed, inject, signal } from '@angular/core';
import { SidebarAdminComponent } from '../../components/sidebar-admin/sidebar-admin.component';
import { ModalCadastrarAdministradorComponent } from '../../components/modal-cadastrar-administrador/modal-cadastrar-administrador.component';
import { ModalEditarAdministradorComponent } from '../../components/modal-editar-administrador/modal-editar-administrador.component';
import { ModalExcluirAdministradorComponent } from '../../components/modal-excluir-administrador/modal-excluir-administrador.component';
import { AdministradoresService } from '../../services/administradores.service';
import {
  Administrador,
  DadosEdicaoAdministrador,
  DadosNovoAdministrador,
  ModalAdministrador,
} from '../../models/administrador.model';

/** Página "07 · Painel admin — Administradores". */
@Component({
  selector: 'app-painel-administradores',
  imports: [
    SidebarAdminComponent,
    ModalCadastrarAdministradorComponent,
    ModalEditarAdministradorComponent,
    ModalExcluirAdministradorComponent,
  ],
  templateUrl: './painel-administradores.component.html',
  styleUrl: './painel-administradores.component.css',
  host: {
    // A tecla Esc fecha qualquer modal aberto
    '(document:keydown.escape)': 'fecharModal()',
  },
})
export class PainelAdministradoresComponent {
  private readonly servico = inject(AdministradoresService);

  /** Texto digitado no campo "Buscar administrador". */
  readonly termoBusca = signal('');

  /** Modal aberto no momento: 'cadastrar', 'editar', 'excluir' ou null. */
  readonly modalAberto = signal<ModalAdministrador>(null);

  /** Administrador clicado em "Editar" ou "Excluir". */
  readonly administradorSelecionado = signal<Administrador | null>(null);

  /** Mensagem de erro mostrada dentro do modal. */
  readonly mensagemErro = signal<string | null>(null);

  /** Total de administradores (mostrado no título da lista). */
  readonly totalAdministradores = this.servico.total;

  /** Lista filtrada pelo nome ou e-mail digitado na busca. */
  readonly administradores = computed(() => {
    const termo = this.termoBusca().trim().toLowerCase();
    const lista = this.servico.administradores();

    if (!termo) {
      return lista;
    }

    return lista.filter(
      (admin) =>
        admin.nome.toLowerCase().includes(termo) || admin.email.toLowerCase().includes(termo),
    );
  });

  /** Atualiza a busca a cada letra digitada. */
  buscar(texto: string): void {
    this.termoBusca.set(texto);
  }

  /** Botão "Novo administrador". */
  abrirCadastro(): void {
    this.mensagemErro.set(null);
    this.administradorSelecionado.set(null);
    this.modalAberto.set('cadastrar');
  }

  /** Botão "Editar" de uma linha da tabela. */
  abrirEdicao(admin: Administrador): void {
    this.mensagemErro.set(null);
    this.administradorSelecionado.set(admin);
    this.modalAberto.set('editar');
  }

  /** Botão "Excluir" de uma linha da tabela. */
  abrirExclusao(admin: Administrador): void {
    this.mensagemErro.set(null);
    this.administradorSelecionado.set(admin);
    this.modalAberto.set('excluir');
  }

  /** Fecha o modal aberto (Cancelar, clique no fundo ou tecla Esc). */
  fecharModal(): void {
    this.modalAberto.set(null);
    this.administradorSelecionado.set(null);
    this.mensagemErro.set(null);
  }

  /** Recebe os dados do modal "Novo administrador". */
  cadastrarAdministrador(dados: DadosNovoAdministrador): void {
    const cadastrou = this.servico.cadastrar(dados);

    if (!cadastrou) {
      this.mensagemErro.set('Já existe um administrador com este e-mail.');
      return;
    }

    this.fecharModal();
  }

  /** Recebe os dados do modal "Editar administrador". */
  salvarAdministrador(dados: DadosEdicaoAdministrador): void {
    const admin = this.administradorSelecionado();
    if (!admin) {
      return;
    }

    const salvou = this.servico.atualizar(admin.id, dados);

    if (!salvou) {
      this.mensagemErro.set('Este e-mail já está sendo usado por outro administrador.');
      return;
    }

    this.fecharModal();
  }

  /** Confirmação do modal "Excluir administrador". */
  excluirAdministrador(): void {
    const admin = this.administradorSelecionado();
    if (admin) {
      this.servico.excluir(admin.id);
    }
    this.fecharModal();
  }
}
