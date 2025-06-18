import { ChangeDetectionStrategy, Component, EventEmitter, Output, ViewEncapsulation } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepicker, MatDatepickerModule } from '@angular/material/datepicker';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';
import { default as _rollupMoment, Moment } from 'moment';
import * as _moment from 'moment';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: { dateInput: 'MM/YYYY' },
  display: {
    dateInput: 'MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};

@Component({
  selector: 'app-date-picker',
  standalone: true,
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.css',
  encapsulation: ViewEncapsulation.None,
  providers: [provideMomentDateAdapter(MY_FORMATS)],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatePicker {
  readonly date = new FormControl(moment());

  @Output() dateSelected = new EventEmitter<Moment>();

  setMonthAndYear(normalizeMonthAndYear: Moment, datePicker: MatDatepicker<Moment>) {
    const ctrlValue = this.date.value ?? moment();
    ctrlValue.month(normalizeMonthAndYear.month());
    ctrlValue.year(normalizeMonthAndYear.year());
    this.date.setValue(ctrlValue);
    this.dateSelected.emit(ctrlValue);
    datePicker.close();
  }
}
