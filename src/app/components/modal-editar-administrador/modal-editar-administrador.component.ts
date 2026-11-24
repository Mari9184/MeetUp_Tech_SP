import { Component, input, output } from '@angular/core';
import { Administrador, DadosEdicaoAdministrador } from '../../models/administrador.model';

/** Modal "Editar administrador". */
@Component({
  selector: 'app-modal-editar-administrador',
  templateUrl: './modal-editar-administrador.component.html',
  styleUrl: './modal-editar-administrador.component.css',
})
export class ModalEditarAdministradorComponent {
  /** Administrador que está sendo editado. */
  readonly administrador = input<Administrador | null>(null);

  /** Mensagem de erro vinda da página (ex.: e-mail já usado por outra pessoa). */
  readonly mensagemErro = input<string | null>(null);

  /** Pede para a página fechar o modal. */
  readonly fechar = output<void>();

  /** Envia os dados alterados para a página. */
  readonly salvar = output<DadosEdicaoAdministrador>();

  /** Chamado ao enviar o formulário. */
  salvarAlteracoes(nome: string, email: string): void {
    if (!nome.trim() || !email.trim()) {
      return;
    }
    this.salvar.emit({ nome, email });
  }

  /** Fecha o modal sem salvar. */
  fecharModal(): void {
    this.fechar.emit();
  }
}
