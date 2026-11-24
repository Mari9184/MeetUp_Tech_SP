import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarAdministrador } from './editar-administrador';

describe('EditarAdministrador', () => {
  let fixture: ComponentFixture<EditarAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAdministrador],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarAdministrador);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows the administrator fields', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#nome-administrador')).toBeTruthy();
    expect(element.querySelector('#email-administrador')).toBeTruthy();
    expect((element.querySelector('.botao-salvar') as HTMLButtonElement).type).toBe('button');
  });
});
