import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpAuthService, LoginRequest } from '../../services/auth-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login-component',
  imports: [FormsModule, CommonModule],
  templateUrl: './login-component.html',
  standalone: true,
  styleUrl: './login-component.css'
})
export class UpdatedLoginComponent {

  @Output() loginSuccess = new EventEmitter<void>();

  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';
  isLoading = false;

  constructor(private authService: HttpAuthService) {}

  login() {
    if (!this.credentials.username || !this.credentials.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginRequest: LoginRequest = {
      username: this.credentials.username,
      password: this.credentials.password
    };

    this.authService.login(loginRequest).subscribe({
      next: (response) => {
        if (response.success) {
          this.loginSuccess.emit();
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.error?.message || 'Invalid credentials. Please try again.';
        this.isLoading = false;
      }
    });
  }
}
