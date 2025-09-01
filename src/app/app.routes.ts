import { Routes } from '@angular/router';
import {UpdatedLoginComponent} from '../components/login-component/login-component';

export const routes: Routes = [
  { path: 'login', component: UpdatedLoginComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // optional
  { path: '**', redirectTo: 'login' } // wildcard fallback
];
