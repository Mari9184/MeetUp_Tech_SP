import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PaginaEventosAdm } from './pagina-eventos-adm';

describe('PaginaEventosAdm', () => {
  let fixture: ComponentFixture<PaginaEventosAdm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaEventosAdm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaEventosAdm);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('exibe os eventos estáticos e a navegação da tabela', () => {
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(fixture.nativeElement.querySelectorAll('.paginacao a')).toHaveLength(4);
    expect(fixture.nativeElement.querySelector('.rodape-tabela').textContent).toContain(
      'Mostrando 6 de 24 eventos',
    );
    expect(fixture.nativeElement.textContent).toContain(
      'React Summit SP: Server Components na prática',
    );
  });
});
