import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {DashboardComponent} from '../components/dashboard-component/dashboard-component';
import {UpdatedLoginComponent} from '../components/login-component/login-component';
import {HttpAuthService} from '../services/auth-service';
import {HttpInventoryService} from '../services/inventory-service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, UpdatedLoginComponent, DashboardComponent],
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

  authService = inject(HttpAuthService);
  inventoryService = inject(HttpInventoryService);

  ngOnInit(): void {
    this.inventoryService.getAllItems();
  }

  onLoginSuccess() {
    console.log('Login successful');
  }
}
