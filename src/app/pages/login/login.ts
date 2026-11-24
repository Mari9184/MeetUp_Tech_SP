import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.services';

@Component({
  imports: [FormsModule],
  selector: 'app-login',
  styleUrl: './login.css',
  templateUrl: './login.html',
})
export class Login {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  senha = '';
  carregando = signal(false);
  erro = signal('');

  async entrar() {
    this.erro.set('');
    this.carregando.set(true);

    try {
      await this.authService.login(this.email.trim(), this.senha);
      await this.router.navigate(['/eventos']);
    } catch (error) {
      const codigo = error instanceof Object && 'code' in error ? String(error.code) : '';

      if (
        codigo === 'auth/invalid-api-key' ||
        codigo.includes('api-key-not-valid') ||
        codigo === 'auth/configuration-not-found'
      ) {
        this.erro.set('A configuração do Firebase está inválida. Confira os dados do app Web no Firebase Console.');
      } else if (codigo === 'auth/invalid-credential' || codigo === 'auth/wrong-password') {
        this.erro.set('E-mail ou senha incorretos.');
      } else if (codigo === 'auth/user-not-found') {
        this.erro.set('Usuário não encontrado.');
      } else if (codigo === 'auth/too-many-requests') {
        this.erro.set('Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.');
      } else if (codigo === 'auth/operation-not-allowed') {
        this.erro.set('O login por e-mail e senha não está habilitado no Firebase Authentication.');
      } else if (codigo === 'auth/network-request-failed') {
        this.erro.set('Não foi possível conectar ao serviço de autenticação.');
      } else {
        this.erro.set('Não foi possível entrar. Verifique os dados e tente novamente.');
      }
    } finally {
      this.carregando.set(false);
    }
  }
}
