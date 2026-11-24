import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { IrEmGrupoAdms } from './ir-em-grupo-adms';

describe('IrEmGrupoAdms', () => {
  let component: IrEmGrupoAdms;
  let fixture: ComponentFixture<IrEmGrupoAdms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IrEmGrupoAdms],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(IrEmGrupoAdms);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
