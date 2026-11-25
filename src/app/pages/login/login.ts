import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  imports: [FormsModule, RouterLink],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  manterConectado = true;
  carregando = signal(false);
  enviandoRecuperacao = signal(false);
  erro = signal('');
  mensagemRecuperacao = signal('');

  async entrar() {
    const emailLimpo = this.email.trim();
    if (!emailLimpo || !this.senha) {
      this.mensagemRecuperacao.set('');
      this.erro.set('Preencha o e-mail e a senha.');
      return;
    }

    this.mensagemRecuperacao.set('');
    this.erro.set('');
    this.carregando.set(true);

    try {
      await this.authService.login(emailLimpo, this.senha);
      await this.router.navigate(['/eventos']);
    } catch (error) {
      this.erro.set(this.traduzirErroFirebase(error, 'login'));
    } finally {
      this.carregando.set(false);
    }
  }

  async esqueciMinhaSenha() {
    const emailLimpo = this.email.trim();
    this.erro.set('');
    this.mensagemRecuperacao.set('');

    if (!emailLimpo) {
      this.erro.set('Digite seu e-mail no campo acima para receber o link de redefinição de senha.');
      return;
    }

    this.enviandoRecuperacao.set(true);

    try {
      await this.authService.recuperarSenha(emailLimpo);
      this.mensagemRecuperacao.set(
        `Enviamos um link de recuperação de senha para ${emailLimpo}. Confira também a caixa de spam.`,
      );
    } catch (error) {
      this.erro.set(this.traduzirErroFirebase(error, 'recuperacao'));
    } finally {
      this.enviandoRecuperacao.set(false);
    }
  }

  private traduzirErroFirebase(error: unknown, contexto: 'login' | 'recuperacao'): string {
    const codigo = error instanceof Object && 'code' in error ? String(error.code) : '';

    if (
      codigo === 'auth/invalid-api-key' ||
      codigo.includes('api-key-not-valid') ||
      codigo === 'auth/configuration-not-found'
    ) {
      return 'A configuração do Firebase está inválida. Confira os dados do app Web no Firebase Console.';
    }

    if (codigo === 'auth/invalid-email') {
      return 'Informe um endereço de e-mail válido.';
    }

    if (contexto === 'recuperacao' && codigo === 'auth/user-not-found') {
      return 'Não encontramos nenhuma conta cadastrada com esse e-mail.';
    }

    if (codigo === 'auth/invalid-credential' || codigo === 'auth/wrong-password') {
      return 'E-mail ou senha incorretos.';
    }

    if (codigo === 'auth/too-many-requests') {
      return 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.';
    }

    if (codigo === 'auth/operation-not-allowed') {
      return 'O login por e-mail e senha não está habilitado no Firebase Authentication.';
    }

    if (codigo === 'auth/network-request-failed') {
      return 'Não foi possível conectar ao serviço de autenticação.';
    }

    return contexto === 'recuperacao'
      ? 'Não foi possível enviar o e-mail de recuperação. Tente novamente.'
      : 'Não foi possível entrar. Verifique os dados e tente novamente.';
  }
}