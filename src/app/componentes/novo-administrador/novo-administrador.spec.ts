import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NovoAdministrador } from './novo-administrador';

describe('NovoAdministrador', () => {
  let fixture: ComponentFixture<NovoAdministrador>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovoAdministrador],
    }).compileComponents();

    fixture = TestBed.createComponent(NovoAdministrador);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('shows the administrator fields', () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('#nome-administrador')).toBeTruthy();
    expect(element.querySelector('#email-administrador')).toBeTruthy();
    expect(element.querySelector('#senha-administrador')).toBeTruthy();
    expect((element.querySelector('.botao-cadastrar') as HTMLButtonElement).type).toBe('button');
  });
});
