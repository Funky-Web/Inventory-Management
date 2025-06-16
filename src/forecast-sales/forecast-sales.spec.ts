import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastSales } from './forecast-sales';

describe('ForecastSales', () => {
  let component: ForecastSales;
  let fixture: ComponentFixture<ForecastSales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastSales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastSales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
