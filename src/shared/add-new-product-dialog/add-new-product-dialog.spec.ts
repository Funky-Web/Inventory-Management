import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddNewProductDialog } from './add-new-product-dialog';

describe('AddNewProductDialog', () => {
  let component: AddNewProductDialog;
  let fixture: ComponentFixture<AddNewProductDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddNewProductDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddNewProductDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
