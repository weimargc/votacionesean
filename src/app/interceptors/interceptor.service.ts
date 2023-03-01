import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';


// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {
//   intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     const user = JSON.parse(localStorage.getItem('user'));
//     if (user && user.token) {
//       request = request.clone({
//         setHeaders: {
//           Authorization: `Token ${user.accessToken}`
//         }
//       });
//     }
//     return next.handle(request);
//   }
// }

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private spinerService: SpinnerService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //console.log('pasando por interceptor');

    this.spinerService.requestStarted();
    const token = sessionStorage.getItem('tokenv');
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      });
      return this.handler(next, request);
    }else{
      return this.handler(next, request);
    }
  }

  handler(next, request) {
    return next.handle(request)
      .pipe(
        tap(
          (event) => {
            if (event instanceof HttpResponse) {
              this.spinerService.requestEnded();
            }
          },
          (error: HttpErrorResponse) => {
            this.spinerService.resetSpinner();
            throw error;
          }
        ),
      )
  };
}

// CLLASE PARA MANEJO DE SPINNER CUANDO SE HACEN PETICIONES
export class SpinnerService {

  private count = 0;
  private spinner$ = new BehaviorSubject<string>('');

  getSpinnerObserver(): Observable<string> {
    return this.spinner$.asObservable();
  }

  requestStarted() {
    //console.log('spinner activado');
    if (++this.count === 1) {
      this.spinner$.next('start');
    }
  }

  requestEnded() {
    //console.log('spinner desactivado');
    if (this.count === 0 || --this.count === 0) {
      this.spinner$.next('stop');
    }
  }

  resetSpinner() {
    //console.log('error en solicitud, reset spinner');
    this.count = 0;
    this.spinner$.next('stop');
  }
}
