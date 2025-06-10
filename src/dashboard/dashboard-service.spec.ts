import { TestBed } from '@angular/core/testing';

import { RecentSalesActivity } from './recent-sales-activity';

describe('DashboardService', () => {
  let service: RecentSalesActivity;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecentSalesActivity);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
