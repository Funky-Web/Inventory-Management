import {Component, EventEmitter, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AuthService} from '../../services/auth-service';

@Component({
  selector: 'app-login-component',
  imports: [
    FormsModule
  ],
  templateUrl: './login-component.html',
  styleUrl: './login-component.css'
})
export class LoginComponent {

  @Output() loginSuccess = new EventEmitter<void>();

  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';

  constructor(private authService: AuthService) {}

  login() {
    const success = this.authService.login(this.credentials.username, this.credentials.password);
    if (success) {
      this.loginSuccess.emit();
    } else {
      this.errorMessage = 'Invalid credentials. Please try again.';
    }
  }

}
