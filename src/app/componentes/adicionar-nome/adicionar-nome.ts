import { Component, output, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-adicionar-nome',
  styleUrl: './adicionar-nome.css',
  templateUrl: './adicionar-nome.html',
})
export class AdicionarNome {
  nome = signal('');
  erroValidacao = signal('');

  cancelar = output<void>();
  confirmar = output<string>();

  aoEnviar(event: Event) {
    event.preventDefault();
    const valorLimpo = this.nome().trim();

    if (!valorLimpo) {
      this.erroValidacao.set('Digite seu nome antes de adicionar.');
      return;
    }

    this.erroValidacao.set('');
    this.confirmar.emit(valorLimpo);
  }
}