import { Component, ElementRef, computed, inject, input, output, viewChild } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

/** Menu lateral do painel administrativo. */
@Component({
  selector: 'app-sidebar-admin',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar-admin.component.html',
  styleUrl: './sidebar-admin.component.css',
})
export class SidebarAdminComponent {
  private readonly router = inject(Router);

  /** Nome e perfil de quem está logado (mostrados no rodapé do menu). */
  readonly nomeUsuario = input('Gabriel T.');
  readonly perfilUsuario = input('Fundador');

  /** Avisa a página quando a pessoa clica em "Sair". */
  readonly sair = output<void>();

  /** Iniciais para o avatar: "Gabriel T." → "GT". */
  readonly iniciais = computed(() =>
    this.nomeUsuario()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((parte) => parte[0].toUpperCase())
      .join(''),
  );

  /** Caixa de seleção que abre e fecha o menu no celular. */
  private readonly controleMenu = viewChild<ElementRef<HTMLInputElement>>('controleMenu');

  /** Fecha o menu do celular depois de escolher uma página. */
  fecharMenu(): void {
    const controle = this.controleMenu();
    if (controle) {
      controle.nativeElement.checked = false;
    }
  }

  /** Sai do painel e volta para a página pública. */
  sairDoPainel(): void {
    this.fecharMenu();
    this.sair.emit();
    this.router.navigate(['/']);
  }
}
