import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastedSales } from './forecasted-sales';

describe('ForecastedSales', () => {
  let component: ForecastedSales;
  let fixture: ComponentFixture<ForecastedSales>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastedSales]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastedSales);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
