import { Component, effect, input, output, signal } from '@angular/core';

export interface DadosNovoAdministrador {
  nome: string;
  email: string;
  senha: string;
}

@Component({
  imports: [],
  selector: 'app-novo-administrador',
  styleUrl: './novo-administrador.css',
  templateUrl: './novo-administrador.html',
})
export class NovoAdministrador {
  salvando = input(false);
  erroServidor = input('');
  dadosIniciais = input<{ nome: string; email: string } | null>(null);
  modoEdicao = input(false);

  cancelar = output<void>();
  confirmar = output<DadosNovoAdministrador>();

  nome = signal('');
  email = signal('');
  senha = signal('');
  erroLocal = signal('');

  constructor() {
    effect(() => {
      const iniciais = this.dadosIniciais();
      this.nome.set(iniciais?.nome ?? '');
      this.email.set(iniciais?.email ?? '');
      this.senha.set('');
      this.erroLocal.set('');
    });
  }

  aoEnviar(event: Event) {
    event.preventDefault();
    if (this.salvando()) return;

    const nomeLimpo = this.nome().trim();
    const emailLimpo = this.email().trim();
    const senhaValor = this.senha();

    if (!nomeLimpo || !emailLimpo) {
      this.erroLocal.set('Preencha o nome e o e-mail.');
      return;
    }

    if (!this.modoEdicao() && senhaValor.length < 6) {
      this.erroLocal.set('A senha inicial deve ter pelo menos 6 caracteres.');
      return;
    }

    this.erroLocal.set('');
    this.confirmar.emit({
      nome: nomeLimpo,
      email: emailLimpo,
      senha: senhaValor,
    });
  }
}