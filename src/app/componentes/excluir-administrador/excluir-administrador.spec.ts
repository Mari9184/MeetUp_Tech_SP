import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExcluirAdministrador } from './excluir-administrador';

describe('ExcluirAdministrador', () => {
  let fixture: ComponentFixture<ExcluirAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExcluirAdministrador],
    }).compileComponents();

    fixture = TestBed.createComponent(ExcluirAdministrador);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('displays placeholder administrator details and retention notice', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.dados-administrador')?.textContent).toContain(
      'Nome do administrador',
    );
    expect(element.querySelector('.dados-administrador')?.textContent).toContain(
      'nome@exemplo.com',
    );
    expect(element.querySelector('.aviso-exclusao')?.textContent).toContain(
      'Os eventos que ela cadastrou serão mantidos.',
    );
  });
});
