import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {
  private readonly messagesSubject = new BehaviorSubject<readonly string[]>([]);

  readonly messages$ = this.messagesSubject.asObservable();
  readonly latestMessage$ = this.messages$.pipe(
    map((messages) => messages[0] ?? null)
  );

  get messages(): readonly string[] {
    return this.messagesSubject.value;
  }

  add(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    const nextMessages = [`[${timestamp}] ${message}`, ...this.messages].slice(0, 20);
    this.messagesSubject.next(nextMessages);
  }

  clear(): void {
    this.messagesSubject.next([]);
  }
}
