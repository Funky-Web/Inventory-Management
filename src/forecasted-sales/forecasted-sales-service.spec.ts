import { TestBed } from '@angular/core/testing';

import { ForecastedSalesService } from './forecasted-sales-service';

describe('ForecastedSalesService', () => {
  let service: ForecastedSalesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ForecastedSalesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
