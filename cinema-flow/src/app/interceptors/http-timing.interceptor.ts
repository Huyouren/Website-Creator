import {
  HttpErrorResponse,
  HttpEvent,
  HttpEventType,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { MessageService } from '../services/message.service';

export const httpTimingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const messageService = inject(MessageService);
  const start = performance.now();

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event.type !== HttpEventType.Response) {
          return;
        }

        const duration = Math.round(performance.now() - start);
        messageService.add(
          `HTTP ${req.method} ${req.urlWithParams} -> ${event.status} (${duration} ms)`
        );
      },
      error: (error: unknown) => {
        const duration = Math.round(performance.now() - start);
        const status =
          error instanceof HttpErrorResponse
            ? error.status || 'NETWORK'
            : 'UNKNOWN';

        messageService.add(
          `HTTP ${req.method} ${req.urlWithParams} -> ${status} (${duration} ms)`
        );
      }
    })
  );
};
