import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { catchError, defer, of, switchMap } from 'rxjs';
import type { Administrador } from '../../models/administrador';
import { AuthService } from '../../services/auth.services';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-menu-lateral',
  styleUrl: './menu-lateral.css',
  templateUrl: './menu-lateral.html',
})
export class MenuLateral {
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  perfil = signal<Administrador | null>(null);
  emailAutenticado = signal('');
  carregandoPerfil = signal(true);
  saindo = signal(false);
  erroPerfil = signal('');
  erroLogout = signal('');

  nomeUsuario = computed(() => {
    const perfil = this.perfil();
    const nomeCompleto = [perfil?.nome?.trim(), perfil?.sobrenome?.trim()]
      .filter(Boolean)
      .join(' ');

    return (
      nomeCompleto ||
      perfil?.email?.trim().split('@')[0] ||
      this.emailAutenticado().split('@')[0] ||
      (this.carregandoPerfil() ? 'Carregando perfil...' : 'Administrador')
    );
  });

  emailUsuario = computed(
    () =>
      this.perfil()?.email?.trim() ||
      this.emailAutenticado() ||
      (this.carregandoPerfil() ? 'Carregando e-mail...' : 'E-mail não disponível'),
  );

  iniciaisUsuario = computed(() =>
    this.nomeUsuario()
      .split(/[\s@._-]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toLocaleUpperCase())
      .join(''),
  );

  constructor() {
    this.authService.user$
      .pipe(
        switchMap((usuario) => {
          this.perfil.set(null);
          this.erroPerfil.set('');
          this.emailAutenticado.set(usuario?.email?.trim() || '');
          this.carregandoPerfil.set(Boolean(usuario));

          if (!usuario) {
            return of(null);
          }

          return defer(() => this.authService.obterPerfilAdministrador(usuario.uid)).pipe(
            catchError((error: unknown) => {
              console.error('Erro ao carregar o perfil do administrador:', error);
              this.erroPerfil.set('Não foi possível carregar os dados do perfil.');
              return of(null);
            }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((perfil) => {
        this.perfil.set(perfil);
        this.carregandoPerfil.set(false);
      });
  }

  async sair() {
    if (this.saindo()) {
      return;
    }

    this.saindo.set(true);
    this.erroLogout.set('');

    try {
      await this.authService.logout();
      const navegou = await this.router.navigate(['/login']);
      if (!navegou) {
        this.erroLogout.set('Sua sessão foi encerrada, mas não foi possível abrir o login.');
      }
    } catch (error) {
      console.error('Erro ao sair da conta do administrador:', error);
      this.erroLogout.set('Não foi possível sair agora. Tente novamente.');
    } finally {
      this.saindo.set(false);
    }
  }
}
