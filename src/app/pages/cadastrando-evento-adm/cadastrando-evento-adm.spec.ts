import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CadastrandoEventoAdm } from './cadastrando-evento-adm';

describe('CadastrandoEventoAdm', () => {
  let component: CadastrandoEventoAdm;
  let fixture: ComponentFixture<CadastrandoEventoAdm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastrandoEventoAdm],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastrandoEventoAdm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
