import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {HttpAuthService} from '../services/auth-service';


@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: HttpAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get token from auth service
    const token = this.authService.getToken();

    console.log("Intercepted token:", token);
    console.log("Request URL:", req.url);

    // Clone the request and add authorization header if token exists
    let authReq = req;
    if (token) {
      authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
    }

    // Handle the request and catch any auth errors
    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          // Token is invalid or expired, clear auth data
          this.authService.logout().subscribe({
            error: () => {
              // Even if logout API fails, clear local data
              localStorage.removeItem('auth_token');
              localStorage.removeItem('user_data');
            }
          });
        }
        return throwError(() => error);
      })
    );
  }
}
