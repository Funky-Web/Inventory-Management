import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private authenticated = false;

  login(username: string, password: string): boolean {
    // Mock authentication - in real app, this would call an API
    if (username === 'admin' && password === 'admin123') {
      this.authenticated = true;
      return true;
    }
    return false;
  }

  logout() {
    this.authenticated = false;
  }

  isAuthenticated(): boolean {
    return this.authenticated;
  }

  constructor() { }
}
