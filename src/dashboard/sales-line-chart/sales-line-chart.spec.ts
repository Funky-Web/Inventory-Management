import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesLineChart } from './sales-line-chart';

describe('SalesLineChart', () => {
  let component: SalesLineChart;
  let fixture: ComponentFixture<SalesLineChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesLineChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesLineChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
