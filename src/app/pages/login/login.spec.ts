import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideRouter([{ path: 'eventos', component: Login }])],
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
});
