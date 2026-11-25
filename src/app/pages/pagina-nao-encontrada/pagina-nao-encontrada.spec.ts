import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaNaoEncontrada } from './pagina-nao-encontrada';

describe('PaginaNaoEncontrada', () => {
  let fixture: ComponentFixture<PaginaNaoEncontrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaNaoEncontrada],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaNaoEncontrada);
    fixture.detectChanges();
  });

  it('exibe a mensagem 404 e links para voltar à navegação', () => {
    const pagina = fixture.nativeElement as HTMLElement;

    expect(pagina.querySelector('h1')?.textContent).toContain('Parece que este evento não existe.');
    expect(pagina.querySelector('nav a[routerLink="/"]')?.textContent).toContain('Voltar para o início');
    expect(pagina.querySelector('a[fragment="eventos"]')?.textContent).toContain('Explorar eventos');
  });
});
