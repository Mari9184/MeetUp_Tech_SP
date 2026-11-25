import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CadastroDeAdms } from './cadastro-de-adms';

describe('CadastroDeAdms', () => {
  let component: CadastroDeAdms;
  let fixture: ComponentFixture<CadastroDeAdms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CadastroDeAdms],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroDeAdms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
