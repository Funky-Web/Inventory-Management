import { Component, Input } from '@angular/core';
import { DialogRef } from '@angular/cdk/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { DatePicker } from '../date-picker/date-picker';
import { Moment } from 'moment';
import { ForecastConfig } from '../../forecast-sales/forecast-config';

@Component({
  selector: 'app-add-new-product-dialog',
  standalone: true,
  templateUrl: './add-new-product-dialog.html',
  styleUrls: ['./add-new-product-dialog.css'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    DatePicker
  ]
})
export class AddNewProductDialog {
  forecastPeriod: number | null = null;
  historicalStart: Date | null = null;
  forecastModel: string | null = null;
  confidenceLevel: number | null = null;
  forecastNotes: string = '';

  @Input() data: any;

  constructor(public dialogRef: DialogRef<ForecastConfig>) {}

  onCancel() {
    this.dialogRef.close();
  }

  isLoading = false;
  forecastResult: any = null;

  onForecast() {
    if (
      this.forecastPeriod === null ||
      this.historicalStart === null ||
      this.forecastModel === null ||
      this.confidenceLevel === null
    ) {
      alert('Please complete all required fields.');
      return;
    }

    const forecastConfig: ForecastConfig = {
      forecastPeriod: this.forecastPeriod,
      historicalStart: this.historicalStart,
      forecastModel: this.forecastModel,
      confidenceLevel: this.confidenceLevel,
      forecastNotes: this.forecastNotes ?? ''
    };

    this.isLoading = true;
    this.forecastResult = null;

    setTimeout(() => {
      this.isLoading = false;
      this.forecastResult = {
        forecastConfig,
        values: [112, 120, 132, 145, 158, 167]
      };
    }, 2000);
  }



  onMonthSelected(selectedDate: Moment) {
    this.historicalStart = selectedDate.toDate();
  }
}
