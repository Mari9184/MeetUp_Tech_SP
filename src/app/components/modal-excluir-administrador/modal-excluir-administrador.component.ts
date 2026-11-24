import { Component, input, output } from '@angular/core';
import { Administrador } from '../../models/administrador.model';

/** Modal de confirmação "Excluir administrador". */
@Component({
  selector: 'app-modal-excluir-administrador',
  templateUrl: './modal-excluir-administrador.component.html',
  styleUrl: './modal-excluir-administrador.component.css',
})
export class ModalExcluirAdministradorComponent {
  /** Administrador que será removido. */
  readonly administrador = input<Administrador | null>(null);

  /** Pede para a página fechar o modal. */
  readonly fechar = output<void>();

  /** Avisa a página que a exclusão foi confirmada. */
  readonly confirmar = output<void>();

  /** Confirma a remoção do acesso. */
  confirmarExclusao(): void {
    this.confirmar.emit();
  }

  /** Fecha o modal sem excluir. */
  fecharModal(): void {
    this.fechar.emit();
  }
}
