import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Documentacion } from './documentacion';

describe('Documentacion', () => {
  let component: Documentacion;
  let fixture: ComponentFixture<Documentacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Documentacion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Documentacion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
