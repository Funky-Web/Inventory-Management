import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForecastProductDialog } from './forecast-product-dialog';

describe('AddNewProductDialog', () => {
  let component: ForecastProductDialog;
  let fixture: ComponentFixture<ForecastProductDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForecastProductDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForecastProductDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
