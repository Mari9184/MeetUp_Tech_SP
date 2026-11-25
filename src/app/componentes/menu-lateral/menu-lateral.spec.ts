import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of } from 'rxjs';
import { MenuLateral } from './menu-lateral';
import { AuthService } from '../../services/auth.services';

describe('MenuLateral', () => {
  let fixture: ComponentFixture<MenuLateral>;
  let authService: {
    user$: Observable<{ uid: string; email: string } | null>;
    obterPerfilAdministrador: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    authService = {
      user$: of({
        uid: 'admin-1',
        email: 'admin@example.com',
      }),
      obterPerfilAdministrador: vi.fn(() =>
        of({
          uid: 'admin-1',
          nome: 'Ana',
          sobrenome: 'Silva',
          email: 'ana@example.com',
        }),
      ),
      logout: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [MenuLateral],
      providers: [
        provideRouter([{ path: 'login', component: MenuLateral }]),
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuLateral);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows the administrative navigation and public site link', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('img[src="/Logo.png"]')).toBeTruthy();
    expect(element.textContent).toContain('Eventos');
    expect(element.textContent).toContain('Cadastrar evento');
    expect(element.textContent).toContain('Ir em grupo');
    expect(element.textContent).toContain('Cadastro de ADMs');
    expect(element.querySelector('a[href="/cadastro-adms"]')).toBeTruthy();
    expect(element.textContent).toContain('Ver site público');
  });

  it('displays the authenticated administrator profile', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Ana Silva');
    expect(element.textContent).toContain('ana@example.com');
    expect(authService.obterPerfilAdministrador).toHaveBeenCalledWith('admin-1');
  });

  it('falls back to the authenticated email when profile fields are empty', () => {
    fixture.componentInstance.perfil.set({
      uid: 'admin-1',
      nome: '',
      email: '',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('admin');
    expect(fixture.nativeElement.textContent).toContain('admin@example.com');
  });

  it('logs out and navigates to login', async () => {
    await fixture.componentInstance.sair();

    expect(authService.logout).toHaveBeenCalledOnce();
    expect(TestBed.inject(Router).url).toBe('/login');
  });

  it('reports logout failures and restores the logout action', async () => {
    authService.logout.mockRejectedValueOnce(new Error('logout failed'));

    await fixture.componentInstance.sair();
    fixture.detectChanges();

    expect(fixture.componentInstance.saindo()).toBe(false);
    expect(fixture.componentInstance.erroLogout()).toContain('Não foi possível sair');
  });
});
