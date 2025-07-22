import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cotizacion } from './cotizacion';

describe('Cotizacion', () => {
  let component: Cotizacion;
  let fixture: ComponentFixture<Cotizacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cotizacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cotizacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
