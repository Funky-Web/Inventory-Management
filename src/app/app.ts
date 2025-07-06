import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import {AuthService} from '../services/auth-service';
import {InventoryService} from '../services/inventory-service';
import {LoginComponent} from '../components/login-component/login-component';
import {DashboardComponent} from '../components/dashboard-component/dashboard-component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoginComponent, DashboardComponent],
  template: `
    <div class="app-container">
      <app-login-component
        *ngIf="!authService.isAuthenticated()"
        (loginSuccess)="onLoginSuccess()">
      </app-login-component>

      <app-dashboard-component
        *ngIf="authService.isAuthenticated()">
      </app-dashboard-component>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
  `]
})
export class App implements OnInit {

  authService = inject(AuthService);
  inventoryService = inject(InventoryService);

  ngOnInit(): void {
    this.inventoryService.generateSampleData();
  }

  onLoginSuccess() {
    console.log('Login successful');
  }
}
