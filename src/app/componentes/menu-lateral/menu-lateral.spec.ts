import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MenuLateral } from './menu-lateral';

describe('MenuLateral', () => {
  let fixture: ComponentFixture<MenuLateral>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuLateral],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(MenuLateral);
    fixture.detectChanges();
    await fixture.whenStable();
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

  it('displays the static user profile', () => {
    expect(fixture.nativeElement.textContent).toContain('Gabriel T.');
    expect(fixture.nativeElement.textContent).toContain('Fundador');
  });
});
