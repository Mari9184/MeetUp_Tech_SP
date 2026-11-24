import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login';
import { AuthService } from '../../services/auth.services';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([{ path: 'eventos', component: Login }]),
        {
          provide: AuthService,
          useValue: {
            login: async () => ({ user: { uid: 'teste' } }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should display the Meetup Tech SP logo', () => {
    const logo = fixture.nativeElement.querySelector('.logo-marca') as HTMLImageElement;

    expect(logo.getAttribute('src')).toBe('Logo.png');
    expect(logo.alt).toBe('Logo Meetup Tech SP');
  });

  it('should navigate to the events page when the login button is clicked', async () => {
    const button = fixture.nativeElement.querySelector('.botao-entrar') as HTMLButtonElement;

    button.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/eventos');
  });

  it('should show a Firebase configuration error and stop loading when login fails', async () => {
    const authService = TestBed.inject(AuthService);
    vi.spyOn(authService, 'login').mockRejectedValue({
      code: 'auth/api-key-not-valid.-please-pass-a-valid-api-key.',
    });

    await fixture.componentInstance.entrar();
    fixture.detectChanges();

    expect(fixture.componentInstance.carregando()).toBe(false);
    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain(
      'configuração do Firebase está inválida',
    );
  });
});
