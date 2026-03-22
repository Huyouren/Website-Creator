import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  constructor() { }

  log(message: string): void {
    console.log(`[${new Date().toLocaleTimeString()}] ${message}`);
  }

  error(message: string): void {
    console.error(`[${new Date().toLocaleTimeString()}] ERROR: ${message}`);
  }

  warn(message: string): void {
    console.warn(`[${new Date().toLocaleTimeString()}] WARN: ${message}`);
  }
}
