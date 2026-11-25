import { Component, EnvironmentInjector, inject, runInInjectionContext } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Router } from '@angular/router';
import { Auth, signOut } from '@angular/fire/auth';

@Component({
  imports: [RouterLink, RouterLinkActive],
  selector: 'app-menu-lateral',
  styleUrl: './menu-lateral.css',
  templateUrl: './menu-lateral.html',
})
export class MenuLateral {
  private auth = inject(Auth, { optional: true });
  private injector = inject(EnvironmentInjector);
  private router = inject(Router);

  async sair() {
    const auth = this.auth;
    if (auth) {
      await runInInjectionContext(this.injector, () => signOut(auth));
    }
    await this.router.navigate(['/login']);
  }
}
