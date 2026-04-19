import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from './message.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly messageService = inject(MessageService);
  private readonly isLoggedInSubject = new BehaviorSubject<boolean>(false);

  readonly isLoggedIn$ = this.isLoggedInSubject.asObservable();

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(username: string, password: string): boolean {
    const success = username === 'admin' && password === 'admin';

    if (success) {
      this.isLoggedInSubject.next(true);
      this.messageService.add(`AuthService: 用户 ${username} 登录成功`);
      return true;
    }

    this.messageService.add(`AuthService: 用户 ${username || 'unknown'} 登录失败`);
    return false;
  }

  logout(): void {
    this.isLoggedInSubject.next(false);
    this.messageService.add('AuthService: 已退出登录');
  }
}
