import { Component, input, output } from '@angular/core';
import { DadosNovoAdministrador } from '../../models/administrador.model';

/** Modal "Novo administrador". */
@Component({
  selector: 'app-modal-cadastrar-administrador',
  templateUrl: './modal-cadastrar-administrador.component.html',
  styleUrl: './modal-cadastrar-administrador.component.css',
})
export class ModalCadastrarAdministradorComponent {
  /** Mensagem de erro vinda da página (ex.: e-mail já cadastrado). */
  readonly mensagemErro = input<string | null>(null);

  /** Pede para a página fechar o modal. */
  readonly fechar = output<void>();

  /** Envia os dados preenchidos para a página. */
  readonly cadastrar = output<DadosNovoAdministrador>();

  /** Chamado ao enviar o formulário. Os campos obrigatórios já são validados pelo navegador. */
  enviarCadastro(nome: string, email: string, senha: string): void {
    if (!nome.trim() || !email.trim() || !senha) {
      return;
    }
    this.cadastrar.emit({ nome, email, senha });
  }

  /** Fecha o modal sem salvar. */
  fecharModal(): void {
    this.fechar.emit();
  }
}
