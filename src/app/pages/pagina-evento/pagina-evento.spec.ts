import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginaEvento } from './pagina-evento';

describe('PaginaEvento', () => {
  let component: PaginaEvento;
  let fixture: ComponentFixture<PaginaEvento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginaEvento],
    }).compileComponents();

    fixture = TestBed.createComponent(PaginaEvento);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows the event and the group section', () => {
    expect(fixture.nativeElement.textContent).toContain('React Summit SP');
    expect(fixture.nativeElement.textContent).toContain('Adicione meu nome');
    expect(fixture.nativeElement.querySelector('[role="dialog"]')).toBeNull();
  });
});
